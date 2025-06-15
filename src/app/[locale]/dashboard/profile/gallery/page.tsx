"use client";

import {
  Calendar,
  Download,
  Eye,
  Filter,
  Grid3X3,
  Heart,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  Search,
  Share,
  Star,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { Input } from "~/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Separator } from "~/ui/primitives/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface Artwork {
  category: "colorization" | "restoration" | "enhancement";
  createdAt: string;
  description: string;
  downloads: number;
  id: string;
  likes: number;
  originalUrl: string;
  processedUrl: string;
  status: "processing" | "completed" | "failed";
  tags: string[];
  title: string;
  views: number;
}

interface Collection {
  artworkCount: number;
  coverUrl: string;
  createdAt: string;
  description: string;
  id: string;
  name: string;
  public: boolean;
}

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  
  const [artworks] = useState<Artwork[]>([
    {
      category: "colorization",
      createdAt: "2024-03-15T10:30:00Z",
      description: "将黑白老照片转换为彩色，重现历史瞬间的色彩",
      downloads: 45,
      id: "art_001",
      likes: 128,
      originalUrl: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=400&h=400&fit=crop",
      processedUrl: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=400&h=400&fit=crop&sat=2",
      status: "completed",
      tags: ["人像", "复古", "黑白转彩色"],
      title: "复古人像色彩化",
      views: 892,
    },
    {
      category: "restoration",
      createdAt: "2024-03-14T15:20:00Z",
      description: "修复老旧照片的划痕和污渍，恢复原有清晰度",
      downloads: 32,
      id: "art_002",
      likes: 95,
      originalUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      processedUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&sharp=2",
      status: "completed",
      tags: ["修复", "老照片", "清晰化"],
      title: "老照片修复",
      views: 654,
    },
    {
      category: "enhancement",
      createdAt: "2024-03-13T09:15:00Z",
      description: "提升图像质量，增强细节和色彩饱和度",
      downloads: 67,
      id: "art_003",
      likes: 203,
      originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      processedUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&sat=1.5&sharp=1.5",
      status: "completed",
      tags: ["风景", "增强", "HDR"],
      title: "风景照片增强",
      views: 1205,
    },
    {
      category: "colorization",
      createdAt: "2024-03-12T14:45:00Z",
      description: "为历史建筑照片添加真实的色彩",
      downloads: 28,
      id: "art_004",
      likes: 76,
      originalUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
      processedUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&sat=1.8",
      status: "completed",
      tags: ["建筑", "历史", "色彩化"],
      title: "历史建筑色彩化",
      views: 432,
    },
    {
      category: "restoration",
      createdAt: "2024-03-11T11:30:00Z",
      description: "正在处理中的家庭合影修复项目",
      downloads: 0,
      id: "art_005",
      likes: 0,
      originalUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop",
      processedUrl: "",
      status: "processing",
      tags: ["家庭", "合影", "修复"],
      title: "家庭合影修复",
      views: 0,
    },
    {
      category: "enhancement",
      createdAt: "2024-03-10T16:20:00Z",
      description: "夜景照片的噪点降低和细节增强",
      downloads: 89,
      id: "art_006",
      likes: 156,
      originalUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=400&fit=crop",
      processedUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=400&fit=crop&sharp=2",
      status: "completed",
      tags: ["夜景", "降噪", "城市"],
      title: "夜景降噪增强",
      views: 987,
    },
  ]);

  const [collections] = useState<Collection[]>([
    {
      artworkCount: 12,
      coverUrl: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e5?w=300&h=200&fit=crop",
      createdAt: "2024-03-01T00:00:00Z",
      description: "收集了各种人像照片的色彩化作品",
      id: "col_001",
      name: "人像色彩化合集",
      public: true,
    },
    {
      artworkCount: 8,
      coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      createdAt: "2024-02-15T00:00:00Z",
      description: "自然风景照片的修复和增强作品",
      id: "col_002",
      name: "风景修复系列",
      public: false,
    },
    {
      artworkCount: 15,
      coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
      createdAt: "2024-01-20T00:00:00Z",
      description: "历史建筑和古迹的色彩化项目",
      id: "col_003",
      name: "历史建筑",
      public: true,
    },
  ]);

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesCategory = selectedCategory === "all" || artwork.category === selectedCategory;
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artwork.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "colorization":
        return <Badge className="bg-blue-100 text-blue-800">色彩化</Badge>;
      case "restoration":
        return <Badge className="bg-green-100 text-green-800">修复</Badge>;
      case "enhancement":
        return <Badge className="bg-purple-100 text-purple-800">增强</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">已完成</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">处理中</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">失败</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLike = (artworkId: string) => {
    toast.success("已添加到收藏");
  };

  const handleShare = (artwork: Artwork) => {
    navigator.clipboard.writeText(`查看我的作品：${artwork.title}`);
    toast.success("分享链接已复制到剪贴板");
  };

  const handleDownload = (artwork: Artwork) => {
    toast.success("开始下载图片");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              作品集
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              展示您的图像处理作品和创作历程
            </p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            上传新作品
          </Button>
        </div>

        <Tabs defaultValue="artworks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="artworks">我的作品</TabsTrigger>
            <TabsTrigger value="collections">作品集合</TabsTrigger>
            <TabsTrigger value="stats">统计数据</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="搜索作品..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        <SelectItem value="colorization">色彩化</SelectItem>
                        <SelectItem value="restoration">修复</SelectItem>
                        <SelectItem value="enhancement">增强</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artworks Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArtworks.map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={artwork.processedUrl || artwork.originalUrl}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      {artwork.status === "processing" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-white text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-2" />
                            <p className="text-sm">处理中...</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        {getCategoryBadge(artwork.category)}
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(artwork.status)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{artwork.title}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {artwork.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(artwork.createdAt)}</span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            {artwork.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="mr-1 h-3 w-3" />
                            {artwork.likes}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-wrap gap-1">
                          {artwork.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedArtwork(artwork)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(artwork.id)}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleShare(artwork)}>
                                <Share className="mr-2 h-4 w-4" />
                                分享
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(artwork)}>
                                <Download className="mr-2 h-4 w-4" />
                                下载
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {filteredArtworks.map((artwork, index) => (
                      <div key={artwork.id}>
                        <div className="flex items-center space-x-4 p-6">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                              src={artwork.processedUrl || artwork.originalUrl}
                              alt={artwork.title}
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{artwork.title}</h3>
                              <div className="flex items-center space-x-2">
                                {getCategoryBadge(artwork.category)}
                                {getStatusBadge(artwork.status)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {artwork.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{formatDate(artwork.createdAt)}</span>
                                <span className="flex items-center">
                                  <Eye className="mr-1 h-3 w-3" />
                                  {artwork.views}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="mr-1 h-3 w-3" />
                                  {artwork.likes}
                                </span>
                                <span className="flex items-center">
                                  <Download className="mr-1 h-3 w-3" />
                                  {artwork.downloads}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedArtwork(artwork)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLike(artwork.id)}
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(artwork)}
                                >
                                  <Share className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredArtworks.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>作品集合</CardTitle>
                <CardDescription>
                  将相关作品组织成集合，便于管理和展示
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {collections.map((collection) => (
                    <Card key={collection.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video">
                        <Image
                          src={collection.coverUrl}
                          alt={collection.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={collection.public ? "default" : "secondary"}>
                            {collection.public ? "公开" : "私有"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">{collection.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {collection.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{collection.artworkCount} 件作品</span>
                          <span>{formatDate(collection.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6">
                  创建新集合
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总作品数
                  </CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artworks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    本月新增 3 件
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总浏览量
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {artworks.reduce((sum, art) => sum + art.views, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    比上月增长 12%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总点赞数
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {artworks.reduce((sum, art) => sum + art.likes, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    平均每件 {Math.round(artworks.reduce((sum, art) => sum + art.likes, 0) / artworks.length)} 个赞
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    总下载量
                  </CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {artworks.reduce((sum, art) => sum + art.downloads, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    本周新增 23 次
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>作品分类分布</CardTitle>
                <CardDescription>
                  查看不同类型作品的数量分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>色彩化作品</span>
                      <span>40%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>图像修复</span>
                      <span>35%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>图像增强</span>
                      <span>25%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Works */}
            <Card>
              <CardHeader>
                <CardTitle>热门作品</CardTitle>
                <CardDescription>
                  根据浏览量和点赞数排序的热门作品
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artworks
                    .filter(art => art.status === "completed")
                    .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
                    .slice(0, 5)
                    .map((artwork, index) => (
                      <div key={artwork.id} className="flex items-center space-x-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={artwork.processedUrl}
                            alt={artwork.title}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{artwork.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {artwork.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="mr-1 h-3 w-3" />
                              {artwork.likes}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Artwork Detail Dialog */}
        <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
          <DialogContent className="sm:max-w-4xl">
            {selectedArtwork && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedArtwork.title}</DialogTitle>
                  <DialogDescription>
                    {selectedArtwork.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">原始图像</h4>
                    <div className="relative aspect-square">
                      <Image
                        src={selectedArtwork.originalUrl}
                        alt="原始图像"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">处理后图像</h4>
                    <div className="relative aspect-square">
                      <Image
                        src={selectedArtwork.processedUrl || selectedArtwork.originalUrl}
                        alt="处理后图像"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCategoryBadge(selectedArtwork.category)}
                      {getStatusBadge(selectedArtwork.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {selectedArtwork.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {selectedArtwork.likes}
                      </span>
                      <span className="flex items-center">
                        <Download className="mr-1 h-3 w-3" />
                        {selectedArtwork.downloads}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtwork.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      创建时间：{formatDate(selectedArtwork.createdAt)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(selectedArtwork)}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        分享
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(selectedArtwork)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}