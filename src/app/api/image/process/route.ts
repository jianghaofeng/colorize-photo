import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";

import { DashscopeImageService } from "~/api/image-gen/DashscopeImageService";
import { db } from "~/db"; // 你的 drizzle client 实例
import { userGenerateRecordsTable } from "~/db/schema/generations/tables";
import { getCurrentSupabaseUser } from "~/lib/supabase-auth";
import { uploadFile } from "~/lib/supabase-storage";

// 从远程URL下载图片并转换为File对象
async function downloadImageFromUrl(url: string, fileName: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
}

export async function POST(request: NextRequest) {
  try {
    const { functionType, imageUrl, prompt }: any = await request.json();

    // 从 Supabase 获取当前用户
    const user = await getCurrentSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }
    const userId = user.id;

    if (!imageUrl || !functionType) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 });
    }

    // 生成唯一ID
    const recordId = nanoid();

    // 创建任务
    const service = new DashscopeImageService();
    const createResp = await service.createEditTask({
      base_image_url: imageUrl,
      function: functionType,
      parameters: {},
      prompt: prompt,
    });
    const task_id = createResp.output.task_id;

    // 插入数据库
    await db.insert(userGenerateRecordsTable).values({
      createdAt: new Date(),
      creditConsumed: 1, // 设置消耗的积分，可以根据实际情况调整
      id: recordId,
      inputUrl: imageUrl,
      parameters: JSON.stringify({ functionType, prompt }),
      status: "pending",
      type: functionType,
      updatedAt: new Date(),
      userId,
      // 其他字段可选填
    });

    // 异步等待任务完成并更新数据库
    (async () => {
      try {
        const result = await service.waitForTaskCompletion(task_id);
        const url = result.output.results?.[0]?.url;
        
        if (url) {
          try {
            // 从远程URL下载图片
            const fileName = `${functionType}_${Date.now()}.jpg`;
            const imageFile = await downloadImageFromUrl(url, fileName);
            
            // 上传到Supabase存储
            const uploadResult = await uploadFile(imageFile, userId);
            
            // 更新数据库记录
            await db
              .update(userGenerateRecordsTable)
              .set({
                completedAt: new Date(),
                errorMessage: null,
                outputUrl: uploadResult.fileUrl, // 使用Supabase存储的URL
                resultMetadata: JSON.stringify({
                  ...result,
                  supabaseUpload: uploadResult
                }),
                status: "completed",
                updatedAt: new Date(),
              })
              .where(eq(userGenerateRecordsTable.id, recordId));
          } catch (uploadErr: any) {
            console.error("上传到Supabase失败:", uploadErr);
            
            // 上传失败但仍然保存原始URL
            await db
              .update(userGenerateRecordsTable)
              .set({
                completedAt: new Date(),
                errorMessage: `上传到存储失败: ${uploadErr.message}`,
                outputUrl: url, // 使用原始URL
                resultMetadata: JSON.stringify(result),
                status: "completed", // 仍然标记为完成，因为图像生成成功
                updatedAt: new Date(),
              })
              .where(eq(userGenerateRecordsTable.id, recordId));
          }
        } else {
          // 没有生成URL
          await db
            .update(userGenerateRecordsTable)
            .set({
              completedAt: new Date(),
              errorMessage: "No result url",
              resultMetadata: JSON.stringify(result),
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(userGenerateRecordsTable.id, recordId));
        }
      } catch (err: any) {
        await db
          .update(userGenerateRecordsTable)
          .set({
            errorMessage: err?.message || "任务失败",
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(userGenerateRecordsTable.id, recordId));
      }
    })();

    // 立即返回 recordId（前端可用此 id 订阅/查询）
    return NextResponse.json({ id: recordId, task_id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "生成失败" },
      { status: 500 },
    );
  }
}
