"use client";

import type { User } from "@supabase/supabase-js";

import {
  Calendar,
  Camera,
  Coins,
  CreditCard,
  Download,
  Edit,
  FileImage,
  MapPin,
  Settings,
  Users
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCurrentUserImage } from "~/lib/hooks/use-current-user-image";
import { useCurrentUserName } from "~/lib/hooks/use-current-user-name";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/primitives/avatar";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Progress } from "~/ui/primitives/progress";
import { Skeleton } from "~/ui/primitives/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface CommunityBadge {
  color: string;
  icon: string;
  id: string;
  name: string;
}

interface MediaUpload {
  date: string;
  id: string;
  name: string;
  size: string;
  type: string;
}

interface ProfilePageProps {
  user: null | User;
}

interface Project {
  contributors: number;
  dueDate: string;
  id: string;
  name: string;
  people: string[];
  progress: number;
  status: "completed" | "in-progress" | "planning";
}

interface UserProfile {
  age: number;
  city: string;
  country: string;
  email: string;
  phone: string;
  postcode: string;
  state: string;
}

interface WorkExperience {
  company: string;
  duration: string;
  position: string;
  type: string;
}

export function ProfilePageClient({ user }: ProfilePageProps) {
  const t = useTranslations();
  const profileImage = useCurrentUserImage();
  const userName = useCurrentUserName();
  const [isPending, setIsPending] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    age: 32,
    city: "Amsterdam",
    country: "Netherlands",
    email: "jenny@example.com",
    phone: "+31 6 1234 56 78",
    postcode: "1012 NL",
    state: "North Holland",
  });

  const [workExperience] = useState<WorkExperience[]>([
    {
      company: "Exanto Studios",
      duration: "2019 - Present",
      position: "Senior Project Manager",
      type: "Full-time",
    },
    {
      company: "Talent Plus",
      duration: "2013 - 2019",
      position: "CRM Product Lead",
      type: "Full-time",
    },
    {
      company: "Twitter Technologies",
      duration: "2010 - 2013",
      position: "UX Research",
      type: "Contract",
    },
  ]);

  const [skills] = useState<string[]>([
    "Web Design",
    "Code Review",
    "Figma",
    "Product Development",
    "Webflow",
    "AI",
    "InDesign",
    "Management",
  ]);

  const [communityBadges] = useState<CommunityBadge[]>([
    { color: "bg-blue-500", icon: "🏆", id: "1", name: "Achievement" },
    { color: "bg-orange-500", icon: "🔥", id: "2", name: "Streak" },
    { color: "bg-green-500", icon: "✅", id: "3", name: "Completed" },
    { color: "bg-purple-500", icon: "💎", id: "4", name: "Premium" },
  ]);

  const [projects] = useState<Project[]>([
    {
      contributors: 4,
      dueDate: "24 Aug, 2024",
      id: "1",
      name: "New Acme software development",
      people: ["👤", "👤", "👤", "👤"],
      progress: 75,
      status: "in-progress",
    },
    {
      contributors: 3,
      dueDate: "10 Sep, 2024",
      id: "2",
      name: "Strategic Partnership Deal",
      people: ["👤", "👤", "👤"],
      progress: 45,
      status: "in-progress",
    },
    {
      contributors: 2,
      dueDate: "19 Sep, 2024",
      id: "3",
      name: "Client Onboarding",
      people: ["👤", "👤"],
      progress: 30,
      status: "planning",
    },
    {
      contributors: 5,
      dueDate: "8 May, 2024",
      id: "4",
      name: "Widget Supply Agreement",
      people: ["👤", "👤", "👤", "👤", "👤"],
      progress: 100,
      status: "completed",
    },
    {
      contributors: 4,
      dueDate: "1 Feb, 2025",
      id: "5",
      name: "Project X Redesign",
      people: ["👤", "👤", "👤", "👤"],
      progress: 15,
      status: "planning",
    },
  ]);

  const [recentUploads] = useState<MediaUpload[]>([
    {
      date: "1 Mar 24 • 8:30 PM",
      id: "1",
      name: "Project-pitch.pdf",
      size: "2.3 MB",
      type: "pdf",
    },
    {
      date: "28 Feb 24 • 3:40 PM",
      id: "2",
      name: "Report-v1.docx",
      size: "1.8 MB",
      type: "docx",
    },
    {
      date: "25 Feb 24 • 6:45 PM",
      id: "3",
      name: "Framework-App.js",
      size: "856 KB",
      type: "js",
    },
    {
      date: "22 Feb 24 • 11:30 AM",
      id: "4",
      name: "Mobile-logo.ai",
      size: "2.1 MB",
      type: "ai",
    },
  ]);

  const [stats, setStats] = useState({
    credits: 1250,
    followers: 2847,
    following: 1293,
    projects: 24,
    uploads: 156,
  });

  const [mediaUploads, setMediaUploads] = useState({
    data: [
      { month: "Jan", value: 400 },
      { month: "Feb", value: 300 },
      { month: "Mar", value: 600 },
      { month: "Apr", value: 800 },
      { month: "May", value: 500 },
      { month: "Jun", value: 700 },
      { month: "Jul", value: 900 },
      { month: "Aug", value: 600 },
      { month: "Sep", value: 800 },
      { month: "Oct", value: 700 },
      { month: "Nov", value: 900 },
      { month: "Dec", value: 1000 },
    ],
    maxValue: 1000,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        // 模拟API调用获取用户资料数据
        console.log("Fetching profile for user:", user.id);

        // 在实际应用中，这里应该是真实的API调用
        // const response = await fetch(`/api/users/${user.id}/profile`);
        // const profileData = await response.json();

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 更新用户邮箱
        setProfile(prev => ({
          ...prev,
          email: user.email || "jenny@example.com",
        }));
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsPending(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const initials = userName
    ?.split(" ")
    ?.map((word) => word[0])
    ?.join("")
    ?.toUpperCase();

  if (isPending) {
    return (
      <div className={`
        relative container mx-auto max-w-7xl bg-gray-50/50 px-4 py-8
        dark:bg-gray-900/50
      `}>
        <div className="mx-auto p-6">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className={`
            grid gap-6
            lg:grid-cols-3
          `}>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen bg-gray-50/50
      dark:bg-gray-900/50
    `}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`
              text-3xl font-bold text-gray-900
              dark:text-white
            `}>
              个人资料
            </h1>
            <p className={`
              text-gray-600
              dark:text-gray-400
            `}>
              管理您的个人信息、作品和设置
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            编辑资料
          </Button>
        </div>

        <div className={`
          grid gap-6
          lg:grid-cols-3
        `}>
          {/* Left Sidebar */}
          <div className={`
            space-y-6
            lg:col-span-1
          `}>
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      {profileImage && (
                        <AvatarImage alt={initials} src={profileImage} />
                      )}
                      <AvatarFallback className="text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`
                      absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2
                      border-white bg-green-500
                      dark:border-gray-800
                    `} />
                  </div>
                  <h2 className={`
                    text-xl font-semibold text-gray-900
                    dark:text-white
                  `}>
                    {userName || "Jenny Klabber"}
                  </h2>
                  <p className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    高级项目经理
                  </p>
                  <div className={`
                    mt-2 flex items-center text-sm text-gray-500
                    dark:text-gray-400
                  `}>
                    <MapPin className="mr-1 h-4 w-4" />
                    {profile.city}, {profile.country}
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <div className="text-center">
                      <div className={`
                        text-lg font-semibold text-gray-900
                        dark:text-white
                      `}>
                        {stats.followers}
                      </div>
                      <div className={`
                        text-xs text-gray-500
                        dark:text-gray-400
                      `}>
                        关注者
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`
                        text-lg font-semibold text-gray-900
                        dark:text-white
                      `}>
                        {stats.following}
                      </div>
                      <div className={`
                        text-xs text-gray-500
                        dark:text-gray-400
                      `}>
                        关注中
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`
                        text-lg font-semibold text-gray-900
                        dark:text-white
                      `}>
                        {stats.projects}
                      </div>
                      <div className={`
                        text-xs text-gray-500
                        dark:text-gray-400
                      `}>
                        项目
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">社区徽章</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {communityBadges.map((badge) => (
                    <div
                      className={`
                        flex h-12 w-12 items-center justify-center rounded-lg
                        ${badge.color}
                        text-white
                      `}
                      key={badge.id}
                    >
                      <span className="text-lg">{badge.icon}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">关于我</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    年龄:
                  </span>
                  <span className="text-sm font-medium">{profile.age}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    城市:
                  </span>
                  <span className="text-sm font-medium">{profile.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    州/省:
                  </span>
                  <span className="text-sm font-medium">{profile.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    国家:
                  </span>
                  <span className="text-sm font-medium">{profile.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    邮编:
                  </span>
                  <span className="text-sm font-medium">{profile.postcode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    电话:
                  </span>
                  <span className="text-sm font-medium">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}>
                    邮箱:
                  </span>
                  <span className="text-sm font-medium">{profile.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">工作经验</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workExperience.map((work, index) => (
                  <div className="flex items-start space-x-3" key={index}>
                    <div className={`
                      mt-1 flex h-8 w-8 items-center justify-center rounded-lg
                      bg-blue-100
                      dark:bg-blue-900/20
                    `}>
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`
                        text-sm font-medium text-gray-900
                        dark:text-white
                      `}>
                        {work.company}
                      </h4>
                      <p className={`
                        text-sm text-gray-600
                        dark:text-gray-400
                      `}>
                        {work.position}
                      </p>
                      <p className={`
                        text-xs text-gray-500
                        dark:text-gray-500
                      `}>
                        {work.duration} • {work.type}
                      </p>
                    </div>
                  </div>
                ))}
                <Button className="mt-4 w-full" size="sm" variant="ghost">
                  查看全部
                </Button>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">技能标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge className="text-xs" key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className={`
            space-y-6
            lg:col-span-2
          `}>
            {/* Quick Actions */}
            <div className={`
              grid gap-4
              md:grid-cols-4
            `}>
              <Link href="/dashboard/profile/settings">
                <Card className={`
                  cursor-pointer transition-colors
                  hover:bg-gray-50
                  dark:hover:bg-gray-800/50
                `}>
                  <CardContent className="flex items-center p-4">
                    <Settings className="mr-3 h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">个人设置</h3>
                      <p className="text-xs text-gray-500">管理账户</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/profile/billing">
                <Card className={`
                  cursor-pointer transition-colors
                  hover:bg-gray-50
                  dark:hover:bg-gray-800/50
                `}>
                  <CardContent className="flex items-center p-4">
                    <CreditCard className="mr-3 h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">账单管理</h3>
                      <p className="text-xs text-gray-500">查看账单</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/profile/credits">
                <Card className={`
                  cursor-pointer transition-colors
                  hover:bg-gray-50
                  dark:hover:bg-gray-800/50
                `}>
                  <CardContent className="flex items-center p-4">
                    <Coins className="mr-3 h-8 w-8 text-yellow-600" />
                    <div>
                      <h3 className="font-medium">积分系统</h3>
                      <p className="text-xs text-gray-500">{stats.credits} 积分</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/profile/gallery">
                <Card className={`
                  cursor-pointer transition-colors
                  hover:bg-gray-50
                  dark:hover:bg-gray-800/50
                `}>
                  <CardContent className="flex items-center p-4">
                    <Camera className="mr-3 h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium">作品集</h3>
                      <p className="text-xs text-gray-500">{stats.uploads} 作品</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Tabs Content */}
            <Tabs className="w-full" defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="projects">项目</TabsTrigger>
                <TabsTrigger value="uploads">上传</TabsTrigger>
                <TabsTrigger value="activity">动态</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-6" value="overview">
                {/* Media Uploads Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>媒体上传统计</span>
                      <Button size="sm" variant="ghost">
                        开始
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      探索与我们博客的激动人心的合作机会。我们致力于建立伙伴关系，分享见解和更多内容。加入我们，分享您的专业知识。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      {/* 简化的图表显示 */}
                      <div className={`
                        flex h-full items-end justify-between space-x-2
                      `}>
                        {mediaUploads.data.map((item, index) => (
                          <div className="flex flex-col items-center" key={index}>
                            <div
                              className="w-8 rounded-t bg-blue-500"
                              style={{
                                height: `${(item.value / mediaUploads.maxValue) * 200}px`,
                              }}
                            />
                            <span className="mt-2 text-xs text-gray-500">
                              {item.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contributors & Assistance */}
                <div className={`
                  grid gap-6
                  md:grid-cols-2
                `}>
                  <Card>
                    <CardHeader>
                      <CardTitle>贡献者</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>TH</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Tyler Hero</p>
                            <p className="text-xs text-gray-500">2 contributions</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>EH</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Esther Howard</p>
                            <p className="text-xs text-gray-500">29 contributions</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>DW</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Darlene Wilson</p>
                            <p className="text-xs text-gray-500">12 contributions</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Arlene McCoy</p>
                            <p className="text-xs text-gray-500">8 contributions</p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" size="sm" variant="ghost">
                        查看所有贡献者
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>技术支持</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="relative h-32 w-32">
                            {/* 简化的饼图 */}
                            <div className={`
                              h-full w-full rounded-full bg-gradient-to-r
                              from-blue-500 via-green-500 via-red-500
                              via-yellow-500 to-purple-500
                            `} />
                            <div className={`
                              absolute inset-4 rounded-full bg-white
                              dark:bg-gray-900
                            `} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-blue-500
                            `} />
                            ERP
                          </div>
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-red-500
                            `} />
                            HRM
                          </div>
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-green-500
                            `} />
                            DMS
                          </div>
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-purple-500
                            `} />
                            CRM
                          </div>
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-yellow-500
                            `} />
                            PMS
                          </div>
                          <div className="flex items-center">
                            <div className={`
                              mr-2 h-2 w-2 rounded-full bg-orange-500
                            `} />
                            AMS
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent className="space-y-6" value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>项目管理</CardTitle>
                    <CardDescription>
                      查看和管理您参与的所有项目
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div
                          className={`
                            flex items-center justify-between rounded-lg border
                            p-4
                          `}
                          key={project.id}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{project.name}</h4>
                            <div className={`
                              mt-2 flex items-center space-x-4 text-sm
                              text-gray-500
                            `}>
                              <span className="flex items-center">
                                <Users className="mr-1 h-4 w-4" />
                                {project.contributors}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {project.dueDate}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className={`
                                flex items-center justify-between text-sm
                              `}>
                                <span>进度</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress className="mt-1" value={project.progress} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge
                              variant={
                                project.status === "completed"
                                  ? "default"
                                  : project.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {project.status === "completed"
                                ? "已完成"
                                : project.status === "in-progress"
                                  ? "进行中"
                                  : "计划中"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      查看所有项目
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="space-y-6" value="uploads">
                <Card>
                  <CardHeader>
                    <CardTitle>最近上传</CardTitle>
                    <CardDescription>
                      查看您最近上传的文件和媒体
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentUploads.map((upload) => (
                        <div
                          className={`
                            flex items-center justify-between rounded-lg border
                            p-3
                          `}
                          key={upload.id}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`
                              flex h-10 w-10 items-center justify-center
                              rounded-lg bg-gray-100
                              dark:bg-gray-800
                            `}>
                              <FileImage className={`
                                h-5 w-5 text-gray-600
                                dark:text-gray-400
                              `} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{upload.name}</p>
                              <p className="text-xs text-gray-500">
                                {upload.size} • {upload.date}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      查看所有文件
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="space-y-6" value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>最近活动</CardTitle>
                    <CardDescription>
                      查看您的最近活动和互动记录
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm">上传了新的项目文件</p>
                          <p className="text-xs text-gray-500">2小时前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm">完成了项目里程碑</p>
                          <p className="text-xs text-gray-500">1天前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                        <div>
                          <p className="text-sm">获得了新的社区徽章</p>
                          <p className="text-xs text-gray-500">3天前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                        <div>
                          <p className="text-sm">参与了团队协作</p>
                          <p className="text-xs text-gray-500">1周前</p>
                        </div>
                      </div>
                    </div>
                    <Button className="mt-4 w-full" variant="outline">
                      查看完整活动记录
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}