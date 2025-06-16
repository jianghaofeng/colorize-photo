import type { DashscopeImageEditRequest, DashscopeImageEditResponse, DashscopeTaskQueryOutput, DashscopeTaskQueryResponse, EmojiVideoRequest, EmojiVideoResponse, EmojiVideoTaskResult, FaceDetectRequest, FaceDetectResponse, LivePortraitDetectRequest, LivePortraitDetectResponse, LivePortraitRequest, LivePortraitResponse, LivePortraitTaskResult, LivePortraitTemplateId, VideoRetalkRequest, VideoRetalkResponse, VideoRetalkTaskResult } from '~/types/dashscope';

export class DashscopeImageService {
  private apiKey: string;
  private baseUrl
    = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';

  // 表情包视频生成API
  private emojiVideoUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis';

  // 表情包人脸检测API
  private faceDetectUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/face-detect';

  // LivePortrait图像检测API（复用face-detect地址，通过model区分）
  private livePortraitDetectUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/face-detect';

  // LivePortrait视频生成API
  private livePortraitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis/';

  private taskQueryUrl = 'https://dashscope.aliyuncs.com/api/v1/tasks';

  // 视频口型替换API
  private videoRetalkUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis/';

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY!;
    if (!this.apiKey) {
      throw new Error('DASHSCOPE_API_KEY environment variable is required');
    }
  }

  /**
   * 创建图像编辑任务
   */
  async createEditTask(
    request: DashscopeImageEditRequest,
  ): Promise<DashscopeImageEditResponse> {
    // 构建请求体
    const requestBody: any = {
      input: {
        base_image_url: request.base_image_url,
        function: request.function,
        prompt: request.prompt,
      },
      model: 'wanx2.1-imageedit',
      parameters: request.parameters,
    };
    const response = await fetch(this.baseUrl, {
      body: JSON.stringify(requestBody),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 启用异步模式
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`wanx api error: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as DashscopeImageEditResponse;
  }

  /**
   * 一键式表情包生成流程：从检测到生成视频
   * @param imageUrl 原始图像URL
   * @param drivenId 表情包模板id
   * @returns 生成的视频URL
   */
  async createEmojiVideoFromImage(
    imageUrl: string,
    drivenId: string,
  ): Promise<string> {
    // 1. 先进行人脸检测
    const detectResult = await this.detectFace(imageUrl);

    if (!detectResult.output.bbox_face || !detectResult.output.ext_bbox_face) {
      throw new Error('Face detection failed: missing bbox_face or ext_bbox_face');
    }

    // 2. 生成表情包视频
    return await this.generateEmojiVideo(
      imageUrl,
      detectResult.output.bbox_face,
      detectResult.output.ext_bbox_face,
      drivenId,
    );
  }

  /**
   * 创建表情包视频生成任务
   * @param imageUrl 经过人脸检测的图像URL
   * @param faceBbox 人脸区域坐标
   * @param extBbox 动态区域坐标
   * @param drivenId 表情包模板id
   * @returns 任务响应
   */
  async createEmojiVideoTask(
    imageUrl: string,
    faceBbox: number[],
    extBbox: number[],
    drivenId: string,
  ): Promise<EmojiVideoResponse> {
    const request: EmojiVideoRequest = {
      input: {
        driven_id: drivenId,
        ext_bbox: extBbox,
        face_bbox: faceBbox,
        image_url: imageUrl,
      },
      model: 'emoji-v1',
    };

    const response = await fetch(this.emojiVideoUrl, {
      body: JSON.stringify(request),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 启用异步模式
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`emoji video create error: ${response.status} - ${errorText}`);
    }

    return await response.json() as EmojiVideoResponse;
  }

  /**
   * 一键式LivePortrait生成流程：从检测到生成视频
   * @param imageUrl 人物肖像图片URL
   * @param audioUrl 音频URL
   * @param options 可选参数
   * @param options.templateId 模板ID
   * @param options.eyeMoveFreq 眼睛移动频率
   * @param options.videoFps 视频帧率
   * @param options.mouthMoveStrength 嘴部移动强度
   * @param options.pasteBack 是否贴回背景
   * @param options.headMoveStrength 头部移动强度
   * @returns 生成的视频URL
   */
  async createLivePortraitFromImage(
    imageUrl: string,
    audioUrl: string,
    options?: {
      eyeMoveFreq?: number;
      headMoveStrength?: number;
      mouthMoveStrength?: number;
      pasteBack?: boolean;
      templateId?: LivePortraitTemplateId;
      videoFps?: number;
    },
  ): Promise<string> {
    // 1. 先进行图像检测
    const detectResult = await this.detectLivePortraitImage(imageUrl);

    if (!detectResult.output.pass) {
      throw new Error(`Image detection failed: ${detectResult.output.message}`);
    }

    // 2. 生成LivePortrait视频
    return await this.generateLivePortrait(
      imageUrl,
      audioUrl,
      options,
    );
  }

  /**
   * 创建LivePortrait视频生成任务
   * @param imageUrl 已通过检测的人物肖像图片URL
   * @param audioUrl 音频URL
   * @param options 可选参数
   * @param options.templateId 模板ID
   * @param options.eyeMoveFreq 眼睛移动频率
   * @param options.videoFps 视频帧率
   * @param options.mouthMoveStrength 嘴部移动强度
   * @param options.pasteBack 是否贴回背景
   * @param options.headMoveStrength 头部移动强度
   * @returns 任务响应
   */
  async createLivePortraitTask(
    imageUrl: string,
    audioUrl: string,
    options?: {
      eyeMoveFreq?: number;
      headMoveStrength?: number;
      mouthMoveStrength?: number;
      pasteBack?: boolean;
      templateId?: LivePortraitTemplateId;
      videoFps?: number;
    },
  ): Promise<LivePortraitResponse> {
    const request: LivePortraitRequest = {
      input: {
        audio_url: audioUrl,
        image_url: imageUrl,
      },
      model: 'liveportrait',
      parameters: {},
    };

    // 添加可选参数
    if (options) {
      if (options.templateId) {
        request.parameters!.template_id = options.templateId;
      }

      if (options.eyeMoveFreq !== undefined) {
        request.parameters!.eye_move_freq = options.eyeMoveFreq;
      }

      if (options.videoFps !== undefined) {
        request.parameters!.video_fps = options.videoFps;
      }

      if (options.mouthMoveStrength !== undefined) {
        request.parameters!.mouth_move_strength = options.mouthMoveStrength;
      }

      if (options.pasteBack !== undefined) {
        request.parameters!.paste_back = options.pasteBack;
      }

      if (options.headMoveStrength !== undefined) {
        request.parameters!.head_move_strength = options.headMoveStrength;
      }
    }

    // 如果parameters为空对象，则删除该字段
    if (Object.keys(request.parameters!).length === 0) {
      request.parameters = undefined;
    }

    const response = await fetch(this.livePortraitUrl, {
      body: JSON.stringify(request),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 启用异步模式
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`live portrait create error: ${response.status} - ${errorText}`);
    }

    return await response.json() as LivePortraitResponse;
  }

  /**
   * 创建视频口型替换任务
   * @param videoUrl 视频URL
   * @param audioUrl 音频URL
   * @param refImageUrl 人脸参考图URL（可选）
   * @param videoExtension 是否扩展视频长度（可选）
   * @returns 任务响应
   */
  async createVideoRetalkTask(
    videoUrl: string,
    audioUrl: string,
    refImageUrl?: string,
    videoExtension?: boolean,
  ): Promise<VideoRetalkResponse> {
    const request: VideoRetalkRequest = {
      input: {
        audio_url: audioUrl,
        video_url: videoUrl,
        ...(refImageUrl && { ref_image_url: refImageUrl }),
      },
      model: 'videoretalk',
      ...(videoExtension !== undefined && {
        parameters: {
          video_extension: videoExtension,
        },
      }),
    };

    const response = await fetch(this.videoRetalkUrl, {
      body: JSON.stringify(request),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 启用异步模式
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`video retalk create error: ${response.status} - ${errorText}`);
    }

    return await response.json() as VideoRetalkResponse;
  }

  /**
   * 表情包人脸检测API
   * 用于检测输入的图像是否符合Emoji视频生成API所需要的图像规范
   * 并获得图像中人脸区域和动态区域范围值
   * @param imageUrl 需要检测的图像URL
   * @returns 检测结果，包含人脸区域和动态区域坐标
   */
  async detectFace(imageUrl: string): Promise<FaceDetectResponse> {
    const request: FaceDetectRequest = {
      input: {
        image_url: imageUrl,
      },
      model: 'emoji-detect-v1',
      parameters: {
        ratio: '1:1', // 表情包只支持1:1，即头部
      },
    };

    const response = await fetch(this.faceDetectUrl, {
      body: JSON.stringify(request),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`face detect error: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as FaceDetectResponse;

    // 如果检测失败，抛出错误
    // if (result.output.code) {
    //   throw new Error(`face detect failed: ${result.output.code} - ${result.output.message}`);
    // }

    return result;
  }

  /**
   * LivePortrait图像检测API
   * 用于检测输入的图片是否满足LivePortrait视频生成所需的人物肖像图片规范
   * @param imageUrl 需要检测的图像URL
   * @returns 检测结果
   */
  async detectLivePortraitImage(imageUrl: string): Promise<LivePortraitDetectResponse> {
    const request: LivePortraitDetectRequest = {
      input: {
        image_url: imageUrl,
      },
      model: 'liveportrait-detect',
    };

    const response = await fetch(this.livePortraitDetectUrl, {
      body: JSON.stringify(request),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`live portrait detect error: ${response.status} - ${errorText}`);
    }

    const result = await response.json() as LivePortraitDetectResponse;

    return result;
  }

  /**
   * 一键式图像编辑（创建任务并等待完成）
   */
  async editImage(request: DashscopeImageEditRequest): Promise<DashscopeTaskQueryOutput> {
    // 创建任务
    const createResponse = await this.createEditTask(request);
    const taskId = createResponse.output.task_id;

    // 等待任务完成
    const result = await this.waitForTaskCompletion(taskId);

    // 返回生成的图片URL列表
    return result.output;
  }

  /**
   * 一键式表情包视频生成（创建任务并等待完成）
   * @param imageUrl 经过人脸检测的图像URL
   * @param faceBbox 人脸区域坐标
   * @param extBbox 动态区域坐标
   * @param drivenId 表情包模板id
   * @returns 生成的视频URL
   */
  async generateEmojiVideo(
    imageUrl: string,
    faceBbox: number[],
    extBbox: number[],
    drivenId: string,
  ): Promise<string> {
    // 创建任务
    const createResponse = await this.createEmojiVideoTask(
      imageUrl,
      faceBbox,
      extBbox,
      drivenId,
    );

    const taskId = createResponse.output.task_id;

    // 等待任务完成
    const result = await this.waitForEmojiVideoTaskCompletion(taskId);

    // 返回生成的视频URL
    if (result.output.video_url) {
      return result.output.video_url;
    }
    throw new Error('No video URL in the task result');
  }

  /**
   * 一键式LivePortrait视频生成（创建任务并等待完成）
   * @param imageUrl 已通过检测的人物肖像图片URL
   * @param audioUrl 音频URL
   * @param options 可选参数
   * @param options.templateId 模板ID
   * @param options.eyeMoveFreq 眼睛移动频率
   * @param options.videoFps 视频帧率
   * @param options.mouthMoveStrength 嘴部移动强度
   * @param options.pasteBack 是否贴回背景
   * @param options.headMoveStrength 头部移动强度
   * @returns 生成的视频URL
   */
  async generateLivePortrait(
    imageUrl: string,
    audioUrl: string,
    options?: {
      eyeMoveFreq?: number;
      headMoveStrength?: number;
      mouthMoveStrength?: number;
      pasteBack?: boolean;
      templateId?: LivePortraitTemplateId;
      videoFps?: number;
    },
  ): Promise<string> {
    // 创建任务
    const createResponse = await this.createLivePortraitTask(
      imageUrl,
      audioUrl,
      options,
    );

    const taskId = createResponse.output.task_id;

    // 等待任务完成
    const result = await this.waitForLivePortraitTaskCompletion(taskId);

    // 返回生成的视频URL
    if (result.output.results?.video_url) {
      return result.output.results.video_url;
    }
    throw new Error('No video URL in the task result');
  }

  /**
   * 一键式视频口型替换（创建任务并等待完成）
   * @param videoUrl 视频URL
   * @param audioUrl 音频URL
   * @param refImageUrl 人脸参考图URL（可选）
   * @param videoExtension 是否扩展视频长度（可选）
   * @returns 生成的视频URL
   */
  async generateVideoRetalk(
    videoUrl: string,
    audioUrl: string,
    refImageUrl?: string,
    videoExtension?: boolean,
  ): Promise<string> {
    // 创建任务
    const createResponse = await this.createVideoRetalkTask(
      videoUrl,
      audioUrl,
      refImageUrl,
      videoExtension,
    );

    const taskId = createResponse.output.task_id;

    // 等待任务完成
    const result = await this.waitForVideoRetalkTaskCompletion(taskId);

    // 返回生成的视频URL
    if (result.output.result?.video_url) {
      return result.output.result.video_url;
    }
    throw new Error('No video URL in the task result');
  }

  /**
   * 检查图像是否符合LivePortrait要求
   * @param imageUrl 需要检测的图像URL
   * @returns true: 图像符合要求，false: 图像不符合要求
   */
  async isValidLivePortraitImage(imageUrl: string): Promise<boolean> {
    const result = await this.detectLivePortraitImage(imageUrl);
    return result.output.pass;
  }

  /**
   * 查询表情包视频生成任务结果
   * @param taskId 任务ID
   * @returns 任务查询结果
   */
  async queryEmojiVideoTask(taskId: string): Promise<EmojiVideoTaskResult> {
    const response = await fetch(`${this.taskQueryUrl}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`emoji video task query error: ${response.status} - ${errorText}`);
    }

    return await response.json() as EmojiVideoTaskResult;
  }

  /**
   * 查询LivePortrait视频生成任务结果
   * @param taskId 任务ID
   * @returns 任务查询结果
   */
  async queryLivePortraitTask(taskId: string): Promise<LivePortraitTaskResult> {
    const response = await fetch(`${this.taskQueryUrl}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`live portrait task query error: ${response.status} - ${errorText}`);
    }

    return await response.json() as LivePortraitTaskResult;
  }

  /**
   * 查询任务状态和结果
   */
  async queryTask(taskId: string): Promise<DashscopeTaskQueryResponse> {
    const response = await fetch(`${this.taskQueryUrl}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `wanx task query error: ${response.status} - ${errorText}`,
      );
    }

    return (await response.json()) as DashscopeTaskQueryResponse;
  }

  /**
   * 查询视频口型替换任务结果
   * @param taskId 任务ID
   * @returns 任务查询结果
   */
  async queryVideoRetalkTask(taskId: string): Promise<VideoRetalkTaskResult> {
    const response = await fetch(`${this.taskQueryUrl}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`video retalk task query error: ${response.status} - ${errorText}`);
    }

    return await response.json() as VideoRetalkTaskResult;
  }

  /**
   * 轮询等待表情包视频生成任务完成
   * @param taskId 任务ID
   * @param maxWaitTime 最大等待时间（毫秒），默认10分钟
   * @param pollInterval 轮询间隔（毫秒），默认5秒
   * @returns 任务查询结果
   */
  async waitForEmojiVideoTaskCompletion(
    taskId: string,
    maxWaitTime = 600000, // 10分钟
    pollInterval = 5000, // 5秒
  ): Promise<EmojiVideoTaskResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.queryEmojiVideoTask(taskId);

      if (result.output.task_status === 'SUCCEEDED') {
        return result;
      }

      if (result.output.task_status === 'FAILED') {
        throw new Error(
          `emoji video task failed: ${result.output.message || 'unknown error'}`,
        );
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('emoji video task timeout');
  }

  /**
   * 轮询等待LivePortrait视频生成任务完成
   * @param taskId 任务ID
   * @param maxWaitTime 最大等待时间（毫秒），默认10分钟
   * @param pollInterval 轮询间隔（毫秒），默认5秒
   * @returns 任务查询结果
   */
  async waitForLivePortraitTaskCompletion(
    taskId: string,
    maxWaitTime = 600000, // 10分钟
    pollInterval = 5000, // 5秒
  ): Promise<LivePortraitTaskResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.queryLivePortraitTask(taskId);

      if (result.output.task_status === 'SUCCEEDED') {
        return result;
      }

      if (result.output.task_status === 'FAILED') {
        throw new Error(
          `live portrait task failed: ${result.output.message || 'unknown error'}`,
        );
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('live portrait task timeout');
  }

  /**
   * 轮询等待任务完成
   */
  async waitForTaskCompletion(
    taskId: string,
    maxWaitTime = 300000, // 5分钟
    pollInterval = 3000, // 3秒
  ): Promise<DashscopeTaskQueryResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.queryTask(taskId);

      if (result.output.task_status === 'SUCCEEDED') {
        return result;
      }

      if (result.output.task_status === 'FAILED') {
        throw new Error(
          `task failed: ${result.output.message || 'unknown error'}`,
        );
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('task timeout');
  }

  /**
   * 轮询等待视频口型替换任务完成
   * @param taskId 任务ID
   * @param maxWaitTime 最大等待时间（毫秒），默认20分钟
   * @param pollInterval 轮询间隔（毫秒），默认5秒
   * @returns 任务查询结果
   */
  async waitForVideoRetalkTaskCompletion(
    taskId: string,
    maxWaitTime = 1200000, // 20分钟
    pollInterval = 5000, // 5秒
  ): Promise<VideoRetalkTaskResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.queryVideoRetalkTask(taskId);

      if (result.output.task_status === 'SUCCEEDED') {
        return result;
      }

      if (result.output.task_status === 'FAILED') {
        throw new Error(
          `video retalk task failed: ${result.output.message || 'unknown error'}`,
        );
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('video retalk task timeout');
  }
}
