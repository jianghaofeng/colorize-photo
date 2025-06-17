'use client';

import { Card, Image } from 'antd';
import { useEffect, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

import { createRealtimeSubscription } from '~/lib/supabase-realtime';
import { createClient } from '~/lib/supabase/client';
import { useSupabase } from '~/lib/supabase/SupabaseProvider';

const { Meta } = Card;

interface GenerationRecord {
  completed_at: null | string;
  created_at: string;
  credit_consumed: number;
  id: string;
  input_url: string;
  output_url: null | string;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  type: 'colorization' | 'restoration';
  user_id?: string;
}

export function GalleryTab() {
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GenerationRecord | null>(null);
  const { user } = useSupabase();
  const supabase = createClient();

  // 获取用户的生成记录
  const fetchGenerations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_generate_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('获取生成记录失败:', error);
        return;
      }

      setGenerations(data || []);
    } catch (error) {
      console.error('获取生成记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [user]);

  // 设置实时订阅
  useEffect(() => {
    if (!user) return;

    const unsubscribe = createRealtimeSubscription<GenerationRecord>(
      'user_generate_records',
      (payload) => {
        console.log('收到生成记录更新:', payload);

        if (payload.eventType === 'INSERT' && payload.new) {
          if (payload.new.status === 'completed') {
            setGenerations(prev => [payload.new!, ...prev]);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          if (payload.new.status === 'completed') {
            setGenerations(prev => {
              const exists = prev.find(g => g.id === payload.new!.id);
              if (exists) {
                return prev.map(g => g.id === payload.new!.id ? payload.new! : g);
              }
              return [payload.new!, ...prev];
            });
          }
        }
      },
      {
        event: 'UPDATE',
        filter: `user_id=eq.${user.id}`,
        schema: 'public'
      }
    );

    return unsubscribe;
  }, [user]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'colorization':
        return '图像上色';
      case 'restoration':
        return '图像修复';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3, 1280: 4 }}
      >
        <Masonry gutter="24px">
          {[...Array(6)].map((_, i) => (
            <div
              className={`
                aspect-square animate-pulse rounded-lg bg-gray-200
                dark:bg-gray-800
              `}
              key={i}
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className={`
          mb-4 text-lg text-gray-500
          dark:text-gray-300
        `}>暂无生成的图片</div>
        <p className={`
          text-gray-400
          dark:text-gray-600
        `}>开始使用AI功能生成您的第一张图片吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className={`
        grid grid-cols-1 gap-4
        md:grid-cols-3
      `}>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-4 shadow-sm
          dark:border-gray-800 dark:bg-gray-900
        `}>
          <div className={`
            text-2xl font-bold text-blue-600
            dark:text-blue-400
          `}>{generations.length}</div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>总生成数量</div>
        </div>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-4 shadow-sm
          dark:border-gray-800 dark:bg-gray-900
        `}>
          <div className={`
            text-2xl font-bold text-green-600
            dark:text-green-400
          `}>
            {generations.filter(g => g.type === 'colorization').length}
          </div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>图像上色</div>
        </div>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-4 shadow-sm
          dark:border-gray-800 dark:bg-gray-900
        `}>
          <div className={`
            text-2xl font-bold text-purple-600
            dark:text-purple-400
          `}>
            {generations.filter(g => g.type === 'restoration').length}
          </div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>图像修复</div>
        </div>
      </div>

      {/* 图片网格 - 使用瀑布流布局 */}
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3, 1280: 4 }}
      >
        <Masonry gutter="24px">
          {generations.map((generation) => (
            <Card
              cover={
                generation.output_url ? (
                  <img
                    alt={`${getTypeLabel(generation.type)} - ${generation.id}`}
                    src={generation.output_url}
                  />
                ) : (
                  <div className={`
                    flex h-full w-full items-center justify-center bg-gray-200
                    dark:bg-gray-800
                  `}>
                    <span className={`
                      text-gray-500
                      dark:text-gray-300
                    `}>处理中...</span>
                  </div>
                )
              }
              hoverable
              key={generation.id}
              onClick={() => setSelectedImage(generation)}
            >
              <Meta description={<div className={`
                text-xs text-gray-500
                dark:text-gray-400
              `}>
                {new Date(generation.completed_at || generation.created_at).toLocaleDateString('zh-CN')}
              </div>} title={<div className={`
                mb-2 flex items-center justify-between
              `}>
                <span className={`
                  text-sm font-medium text-gray-900
                  dark:text-gray-100
                `}>
                  {getTypeLabel(generation.type)}
                </span>
                <span className={`
                  text-xs text-gray-500
                  dark:text-gray-400
                `}>
                  {generation.credit_consumed} 积分
                </span>
              </div>} />
            </Card>
          ))}
        </Masonry>
      </ResponsiveMasonry>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div className={`
          bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center
          bg-black p-4
        `}>
          <div className={`
            max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white
            dark:bg-gray-900
          `}>
            <div className={`
              flex items-center justify-between border-b border-gray-200 p-4
              dark:border-gray-800
            `}>
              <h3 className={`
                text-lg font-semibold text-gray-900
                dark:text-gray-100
              `}>
                {getTypeLabel(selectedImage.type)} - 详情
              </h3>
              <button
                className={`
                  text-gray-500
                  hover:text-gray-700
                  dark:text-gray-400 dark:hover:text-gray-200
                `}
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className={`
                grid grid-cols-1 gap-6
                md:grid-cols-2
              `}>
                {/* 原图 */}
                <div>
                  <h4 className={`
                    mb-2 text-sm font-medium text-gray-700
                    dark:text-gray-300
                  `}>原图</h4>
                  <div className={`
                    relative aspect-square overflow-hidden rounded-lg
                  `}>
                    <Image
                      alt="原图"
                      className="object-cover"
                      src={selectedImage.input_url}
                    />
                  </div>
                </div>
                {/* 处理后 */}
                <div>
                  <h4 className={`
                    mb-2 text-sm font-medium text-gray-700
                    dark:text-gray-300
                  `}>处理后</h4>
                  <div className={`
                    relative aspect-square overflow-hidden rounded-lg
                  `}>
                    {selectedImage.output_url ? (
                      <Image
                        alt="处理后"
                        className="object-cover"
                        src={selectedImage.output_url}
                      />
                    ) : (
                      <div className={`
                        flex h-full w-full items-center justify-center
                        bg-gray-200
                        dark:bg-gray-800
                      `}>
                        <span className={`
                          text-gray-500
                          dark:text-gray-300
                        `}>处理中...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`
                    text-gray-600
                    dark:text-gray-400
                  `}>类型：</span>
                  <span className={`
                    font-medium text-gray-900
                    dark:text-gray-100
                  `}>{getTypeLabel(selectedImage.type)}</span>
                </div>
                <div>
                  <span className={`
                    text-gray-600
                    dark:text-gray-400
                  `}>消耗积分：</span>
                  <span className={`
                    font-medium text-gray-900
                    dark:text-gray-100
                  `}>{selectedImage.credit_consumed}</span>
                </div>
                <div>
                  <span className={`
                    text-gray-600
                    dark:text-gray-400
                  `}>创建时间：</span>
                  <span className={`
                    font-medium text-gray-900
                    dark:text-gray-100
                  `}>
                    {new Date(selectedImage.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div>
                  <span className={`
                    text-gray-600
                    dark:text-gray-400
                  `}>完成时间：</span>
                  <span className={`
                    font-medium text-gray-900
                    dark:text-gray-100
                  `}>
                    {selectedImage.completed_at
                      ? new Date(selectedImage.completed_at).toLocaleString('zh-CN')
                      : '处理中'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}