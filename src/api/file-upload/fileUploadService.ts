import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, asc } from 'drizzle-orm';

import { db } from '~/db';
import type { MediaUpload } from '~/db/schema';
import { uploadsTable } from '~/db/schema';

import { createClient } from '~/lib/supabase/server';

// 通用API响应接口
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
  success: boolean;
}

// 批量上传结果
export interface BatchUploadResult {
  failureCount: number;
  results: FileUploadResult[];
  success: boolean;
  successCount: number;
}

// 文件上传配置
export interface FileUploadConfig {
  allowedTypes: string[]; // 允许的文件类型
  bucket: string; // 存储桶名称
  folder?: string; // 文件夹路径
  maxFileSize: number; // 最大文件大小（字节）
}

// 文件上传结果
export interface FileUploadResult {
  error?: string;
  file?: {
    id: string;
    key: string;
    name: string;
    size: number;
    type: string;
    url: string;
  };
  success: boolean;
}

// 文件上传进度回调
export interface UploadProgress {
  loaded: number;
  percentage: number;
  total: number;
}

// 默认配置
const DEFAULT_CONFIG: FileUploadConfig = {
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  bucket: 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// 图片专用配置
export const IMAGE_UPLOAD_CONFIG: FileUploadConfig = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  bucket: 'live-photos',
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

// 文档专用配置
export const DOCUMENT_UPLOAD_CONFIG: FileUploadConfig = {
  allowedTypes: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  bucket: 'documents',
  folder: 'user-documents',
  maxFileSize: 20 * 1024 * 1024, // 20MB
};

export class FileUploadService {
  private supabase;

  constructor(customClient?: any) {
    this.supabase = customClient || createClient();
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string, userId: string): Promise<ApiResponse<null>> {
    try {
      // 获取文件信息
      const fileData = await db.query.uploadsTable.findFirst({
        where: and(
          eq(uploadsTable.id, fileId),
          eq(uploadsTable.userId, userId)
        )
      });

      if (!fileData) {
        throw new Error('文件不存在或无权限删除');
      }

      // 从Storage删除文件
      const bucketName = this.getBucketFromUrl(fileData.url);
      const { error: storageError } = await this.supabase.storage
        .from(bucketName)
        .remove([fileData.key]);

      if (storageError) {
        console.warn('Storage删除失败:', storageError.message);
      }

      // 从数据库删除记录
      await db.delete(uploadsTable)
        .where(and(
          eq(uploadsTable.id, fileId),
          eq(uploadsTable.userId, userId)
        ));

      return {
        data: null,
        message: '文件删除成功',
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '删除失败',
        success: false,
      };
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(fileIds: string[], userId: string): Promise<ApiResponse<{ failureCount: number; successCount: number; }>> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const fileId of fileIds) {
      const result = await this.deleteFile(fileId, userId);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        if (result.error) {
          errors.push(`${fileId}: ${result.error}`);
        }
      }
    }

    return {
      data: { failureCount, successCount },
      error: errors.length > 0 ? errors.join('; ') : undefined,
      message: `删除完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
      success: successCount > 0,
    };
  }

  /**
   * 生成预签名上传URL（用于大文件上传）
   */
  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
  ): Promise<ApiResponse<{ filePath: string; uploadUrl: string; }>> {
    try {
      const filePath = this.generateFilePath(
        { name: fileName, type: fileType } as File,
        config,
        userId,
      );

      // Supabase Storage 不直接支持预签名URL，这里返回路径供客户端使用
      return {
        data: {
          filePath,
          uploadUrl: '', // Supabase使用客户端直接上传
        },
        message: '生成上传路径成功',
        success: true,
      };
    } catch (error) {
      return {
        data: { filePath: '', uploadUrl: '' },
        error: error instanceof Error ? error.message : '生成上传路径失败',
        success: false,
      };
    }
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(userId: string): Promise<ApiResponse<{
    totalFiles: number;
    totalSize: number;
    typeBreakdown: Record<string, number>;
  }>> {
    try {
      const files = await db.select({ type: uploadsTable.type })
        .from(uploadsTable)
        .where(eq(uploadsTable.userId, userId));

      const totalFiles = files.length;
      const typeBreakdown: Record<string, number> = {};

      for (const file of files) {
        typeBreakdown[file.type] = (typeBreakdown[file.type] || 0) + 1;
      };

      return {
        data: {
          totalFiles,
          totalSize: 0, // 需要额外查询或存储文件大小信息
          typeBreakdown,
        },
        message: '获取统计信息成功',
        success: true,
      };
    } catch (error) {
      return {
        data: {
          totalFiles: 0,
          totalSize: 0,
          typeBreakdown: {},
        },
        error: error instanceof Error ? error.message : '获取统计信息失败',
        success: false,
      };
    }
  }

  /**
   * 获取用户文件列表
   */
  async getUserFiles(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'type' | 'updatedAt';
      sortOrder?: 'asc' | 'desc';
      type?: string;
    },
  ): Promise<ApiResponse<MediaUpload[]>> {
    try {
      let query = db.select()
        .from(uploadsTable)
        .where(eq(uploadsTable.userId, userId));

      // 构建查询条件
      let whereConditions = eq(uploadsTable.userId, userId);
      
      // 按类型筛选
      if (options?.type) {
        whereConditions = and(
          whereConditions,
          eq(uploadsTable.type, options.type)
        );
      }
      
      // 创建基本查询
      let queryBuilder = db.select()
        .from(uploadsTable)
        .where(whereConditions);
      
      // 排序
      const sortBy = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder || 'desc';
      
      // 根据排序字段和顺序动态设置排序
      if (sortBy === 'createdAt') {
        queryBuilder = queryBuilder.orderBy(sortOrder === 'asc' ? asc(uploadsTable.createdAt) : desc(uploadsTable.createdAt));
      } else if (sortBy === 'updatedAt') {
        queryBuilder = queryBuilder.orderBy(sortOrder === 'asc' ? asc(uploadsTable.updatedAt) : desc(uploadsTable.updatedAt));
      } else if (sortBy === 'type') {
        queryBuilder = queryBuilder.orderBy(sortOrder === 'asc' ? asc(uploadsTable.type) : desc(uploadsTable.type));
      }
      
      // 分页
      if (options?.limit) {
        const offset = options.offset || 0;
        queryBuilder = queryBuilder.limit(options.limit).offset(offset);
      }
      
      const data = await queryBuilder;

      return {
        data: data || [],
        message: '获取文件列表成功',
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : '获取文件列表失败',
        success: false,
      };
    }
  }

  /**
   * 上传单个文件到Supabase Storage
   */
  async uploadFile(
    file: File,
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<FileUploadResult> {
    try {
      // 验证文件
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return {
          error: validation.error,
          success: false,
        };
      }

      // 生成文件路径
      const filePath = this.generateFilePath(file, config, userId);
      const fileId = uuidv4();

      // 上传到Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from(config.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`文件上传失败: ${uploadError.message}`);
      }

      // 获取公共URL
      const { data: urlData } = this.supabase.storage
        .from(config.bucket)
        .getPublicUrl(filePath);

      // 保存文件信息到数据库
      const uploadRecord = {
        createdAt: new Date(),
        id: fileId,
        key: filePath,
        type: file.type,
        updatedAt: new Date(),
        url: urlData.publicUrl,
        userId,
      };

      try {
        await db.insert(uploadsTable).values(uploadRecord);
      } catch (dbError) {
        // 如果数据库保存失败，删除已上传的文件
        await this.supabase.storage.from(config.bucket).remove([filePath]);
        throw new Error(`数据库保存失败: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }

      // 模拟进度回调
      if (onProgress) {
        onProgress({ loaded: file.size, percentage: 100, total: file.size });
      }

      return {
        file: {
          id: fileId,
          key: filePath,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
        },
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '上传失败',
        success: false,
      };
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  ): Promise<BatchUploadResult> {
    const results: FileUploadResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const result = await this.uploadFile(
        file,
        userId,
        config,
        onProgress ? progress => onProgress(i, progress) : undefined,
      );

      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    return {
      failureCount,
      results,
      success: successCount > 0,
      successCount,
    };
  }

  /**
   * 生成文件路径
   */
  private generateFilePath(file: File, config: FileUploadConfig, userId: string): string {
    const timestamp = Date.now();
    const randomId = uuidv4().substring(0, 8);
    const extension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}_${randomId}.${extension}`;

    const basePath = config.folder ? `${config.folder}/${userId}` : userId;
    return `${basePath}/${fileName}`;
  }

  /**
   * 从URL提取bucket名称
   */
  private getBucketFromUrl(url: string): string {
    // 假设URL格式为: https://xxx.supabase.co/storage/v1/object/public/bucket/path
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)/);
    return match ? match[1]! : 'uploads';
  }

  /**
   * 验证文件
   */
  private validateFile(file: File, config: FileUploadConfig): { error?: string; valid: boolean; } {
    // 检查文件大小
    if (file.size > config.maxFileSize) {
      return {
        error: `文件大小超过限制（${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB）`,
        valid: false,
      };
    }

    // 检查文件类型
    if (!config.allowedTypes.includes(file.type)) {
      return {
        error: `不支持的文件类型：${file.type}`,
        valid: false,
      };
    }

    return { valid: true };
  }
}

// 导出单例实例
export const fileUploadService = new FileUploadService();

// 工具函数
export const FileUploadUtils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * 生成文件预览URL
   */
  generatePreviewUrl(file: MediaUpload): string {
    if (this.isImageFile(file.type)) {
      return file.url;
    }
    // 对于非图片文件，可以返回默认图标或文档预览服务URL
    return '/icons/file-default.svg';
  },

  /**
   * 获取文件扩展名
   */
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  },

  /**
   * 检查是否为文档文件
   */
  isDocumentFile(fileType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return documentTypes.includes(fileType);
  },

  /**
   * 检查是否为图片文件
   */
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  },
};
