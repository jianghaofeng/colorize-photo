"use client";

import { useEffect, useState } from "react";

import { twoFactor } from "~/lib/supabase-mfa";
import { useSupabase } from "~/lib/supabase/SupabaseProvider";

interface FormData {
  age: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface PasswordData {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
}

interface UserProfile {
  age: null | number;
  email: string;
  emailVerified: boolean;
  firstName: null | string;
  id: string;
  image: null | string;
  lastName: null | string;
  name: string;
  twoFactorEnabled: boolean | null;
}

export function SettingsTab() {
  const [profile, setProfile] = useState<null | UserProfile>(null);
  const [formData, setFormData] = useState<FormData>({
    age: "",
    firstName: "",
    lastName: "",
    name: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<null | {
    text: string;
    type: "error" | "success";
  }>(null);
  const [activeSection, setActiveSection] = useState<
    "password" | "profile" | "security"
  >("profile");
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    loading: boolean;
    qrCode?: string;
    secret?: string;
  }>({ enabled: false, loading: false });

  const { supabase, user } = useSupabase();

  // 获取用户资料
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("获取用户资料失败:", error);
        return;
      }

      setProfile(data);
      setFormData({
        age: data.age?.toString() || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        name: data.name || "",
      });
      setTwoFactorStatus((prev) => ({
        ...prev,
        enabled: data.twoFactorEnabled || false,
      }));
    } catch (error) {
      console.error("获取用户资料失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // 更新用户资料
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updateData: any = {
        age: formData.age ? Number.parseInt(formData.age) : null,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        name: formData.name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // 同时更新 Supabase Auth 用户元数据
      await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          full_name: formData.name,
          last_name: formData.lastName,
        },
      });

      setMessage({ text: "个人资料更新成功！", type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error("更新用户资料失败:", error);
      setMessage({ text: error.message || "更新失败，请重试", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "新密码和确认密码不匹配", type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: "新密码长度至少为6位", type: "error" });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage({ text: "密码修改成功！", type: "success" });
      setPasswordData({
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (error: any) {
      console.error("修改密码失败:", error);
      setMessage({
        text: error.message || "密码修改失败，请重试",
        type: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // 启用双因素认证
  const handleEnableTwoFactor = async () => {
    setTwoFactorStatus((prev) => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      const { data }: any = await twoFactor.enable({ password: "" });
      const result = {
        qrCode: data.totpURI,
        secret: data.secret,
      };
      setTwoFactorStatus({
        enabled: false,
        loading: false,
        qrCode: result.qrCode,
        secret: result.secret,
      });
      setMessage({ text: "请扫描二维码并输入验证码完成设置", type: "success" });
    } catch (error: any) {
      console.error("启用双因素认证失败:", error);
      setMessage({ text: error.message || "启用失败，请重试", type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // 禁用双因素认证
  const handleDisableTwoFactor = async () => {
    const password = prompt("请输入您的密码以禁用双因素认证:");
    if (!password) return;

    setTwoFactorStatus((prev) => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.disable({ password });
      setTwoFactorStatus({ enabled: false, loading: false });
      setMessage({ text: "双因素认证已禁用", type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error("禁用双因素认证失败:", error);
      setMessage({ text: error.message || "禁用失败，请重试", type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // 验证双因素认证
  const handleVerifyTwoFactor = async () => {
    const code = prompt("请输入6位验证码:");
    if (!code) return;

    setTwoFactorStatus((prev) => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.verify({ code, factorId: twoFactorStatus.secret! });
      setTwoFactorStatus({ enabled: true, loading: false });
      setMessage({ text: "双因素认证设置成功！", type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error("验证双因素认证失败:", error);
      setMessage({ text: error.message || "验证失败，请重试", type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`
          h-64 animate-pulse rounded-lg bg-gray-200
          dark:bg-gray-700
        `} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div
          className={`
            rounded-lg p-4
            ${message.type === "success"
              ? `
                border border-green-200 bg-green-100 text-green-700
                dark:border-green-800 dark:bg-green-900/30 dark:text-green-400
              `
              : `
                border border-red-200 bg-red-100 text-red-700
                dark:border-red-800 dark:bg-red-900/30 dark:text-red-400
              `
            }
          `}
        >
          {message.text}
        </div>
      )}

      {/* Tab导航 */}
      <div className={`
        rounded-lg border bg-white shadow-sm
        dark:border-gray-700 dark:bg-gray-800
      `}>
        <div className={`
          border-b
          dark:border-gray-700
        `}>
          <nav className="flex space-x-8 px-6">
            {[
              { key: "profile", label: "个人资料" },
              { key: "password", label: "密码设置" },
              { key: "security", label: "安全设置" },
            ].map((tab) => (
              <button
                className={`
                  border-b-2 px-1 py-4 text-sm font-medium
                  ${activeSection === tab.key
                    ? `
                      border-blue-500 text-blue-600
                      dark:border-blue-400 dark:text-blue-400
                    `
                    : `
                      border-transparent text-gray-500
                      hover:border-gray-300 hover:text-gray-700
                      dark:text-gray-400 dark:hover:border-gray-600
                      dark:hover:text-gray-300
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSection === "profile" && (
            <div className="max-w-2xl">
              <h3 className={`
                mb-6 text-lg font-semibold
                dark:text-white
              `}>
                个人资料
              </h3>
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div className={`
                  grid grid-cols-1 gap-6
                  md:grid-cols-2
                `}>
                  <div>
                    <label className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}>
                      邮箱
                    </label>
                    <input
                      className={`
                        w-full cursor-not-allowed rounded-lg border
                        border-gray-300 bg-gray-100 px-3 py-2
                        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300
                      `}
                      disabled
                      type="email"
                      value={profile?.email || ""}
                    />
                    <p className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}>
                      邮箱地址无法修改
                    </p>
                  </div>

                  <div>
                    <label className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}>
                      显示名称 *
                    </label>
                    <input
                      className={`
                        w-full rounded-lg border border-gray-300 px-3 py-2
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white
                      `}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      type="text"
                      value={formData.name}
                    />
                  </div>

                  <div>
                    <label className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}>
                      名字
                    </label>
                    <input
                      className={`
                        w-full rounded-lg border border-gray-300 px-3 py-2
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white
                      `}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      type="text"
                      value={formData.firstName}
                    />
                  </div>

                  <div>
                    <label className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}>
                      姓氏
                    </label>
                    <input
                      className={`
                        w-full rounded-lg border border-gray-300 px-3 py-2
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white
                      `}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      type="text"
                      value={formData.lastName}
                    />
                  </div>

                  <div>
                    <label className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}>
                      年龄
                    </label>
                    <input
                      className={`
                        w-full rounded-lg border border-gray-300 px-3 py-2
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-700 dark:text-white
                      `}
                      max="120"
                      min="1"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      type="number"
                      value={formData.age}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className={`
                      rounded-lg bg-blue-600 px-6 py-2 text-white
                      hover:bg-blue-700
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                    disabled={saving}
                    type="submit"
                  >
                    {saving ? "保存中..." : "保存更改"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "password" && (
            <div className="max-w-2xl">
              <h3 className={`
                mb-6 text-lg font-semibold
                dark:text-white
              `}>
                修改密码
              </h3>
              <form className="space-y-6" onSubmit={handleChangePassword}>
                <div>
                  <label className={`
                    mb-2 block text-sm font-medium text-gray-700
                    dark:text-gray-300
                  `}>
                    当前密码
                  </label>
                  <input
                    className={`
                      w-full rounded-lg border border-gray-300 px-3 py-2
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                      dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    `}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    type="password"
                    value={passwordData.currentPassword}
                  />
                </div>

                <div>
                  <label className={`
                    mb-2 block text-sm font-medium text-gray-700
                    dark:text-gray-300
                  `}>
                    新密码
                  </label>
                  <input
                    className={`
                      w-full rounded-lg border border-gray-300 px-3 py-2
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                      dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    `}
                    minLength={6}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    type="password"
                    value={passwordData.newPassword}
                  />
                  <p className={`
                    mt-1 text-xs text-gray-500
                    dark:text-gray-400
                  `}>
                    密码长度至少为6位
                  </p>
                </div>

                <div>
                  <label className={`
                    mb-2 block text-sm font-medium text-gray-700
                    dark:text-gray-300
                  `}>
                    确认新密码
                  </label>
                  <input
                    className={`
                      w-full rounded-lg border border-gray-300 px-3 py-2
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                      dark:border-gray-600 dark:bg-gray-700 dark:text-white
                    `}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    type="password"
                    value={passwordData.confirmPassword}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    className={`
                      rounded-lg bg-blue-600 px-6 py-2 text-white
                      hover:bg-blue-700
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                    disabled={changingPassword}
                    type="submit"
                  >
                    {changingPassword ? "修改中..." : "修改密码"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "security" && (
            <div className="max-w-2xl space-y-6">
              <h3 className={`
                text-lg font-semibold
                dark:text-white
              `}>
                安全设置
              </h3>

              {/* 邮箱验证状态 */}
              <div className={`
                rounded-lg bg-gray-50 p-4
                dark:bg-gray-800
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`
                      font-medium text-gray-900
                      dark:text-white
                    `}>
                      邮箱验证
                    </h4>
                    <p className={`
                      text-sm text-gray-600
                      dark:text-gray-400
                    `}>
                      验证您的邮箱地址以提高账户安全性
                    </p>
                  </div>
                  <div
                    className={`
                      rounded-full px-3 py-1 text-sm font-medium
                      ${profile?.emailVerified
                        ? `
                          bg-green-100 text-green-700
                          dark:bg-green-900/30 dark:text-green-400
                        `
                        : `
                          bg-yellow-100 text-yellow-700
                          dark:bg-yellow-900/30 dark:text-yellow-400
                        `
                      }
                    `}
                  >
                    {profile?.emailVerified ? "已验证" : "未验证"}
                  </div>
                </div>
              </div>

              {/* 双因素认证 */}
              <div className={`
                rounded-lg bg-gray-50 p-4
                dark:bg-gray-800
              `}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className={`
                      font-medium text-gray-900
                      dark:text-white
                    `}>
                      双因素认证 (2FA)
                    </h4>
                    <p className={`
                      text-sm text-gray-600
                      dark:text-gray-400
                    `}>
                      为您的账户添加额外的安全保护
                    </p>
                  </div>
                  <div
                    className={`
                      rounded-full px-3 py-1 text-sm font-medium
                      ${twoFactorStatus.enabled
                        ? `
                          bg-green-100 text-green-700
                          dark:bg-green-900/30 dark:text-green-400
                        `
                        : `
                          bg-gray-100 text-gray-700
                          dark:bg-gray-700 dark:text-gray-300
                        `
                      }
                    `}
                  >
                    {twoFactorStatus.enabled ? "已启用" : "未启用"}
                  </div>
                </div>

                {!twoFactorStatus.enabled && !twoFactorStatus.qrCode && (
                  <button
                    className={`
                      rounded-lg bg-blue-600 px-4 py-2 text-white
                      hover:bg-blue-700
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                    disabled={twoFactorStatus.loading}
                    onClick={handleEnableTwoFactor}
                  >
                    {twoFactorStatus.loading ? "设置中..." : "启用双因素认证"}
                  </button>
                )}

                {twoFactorStatus.qrCode && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        alt="2FA QR Code"
                        className={`
                          mx-auto mb-4
                          dark:rounded dark:border dark:border-gray-600
                        `}
                        src={twoFactorStatus.qrCode}
                      />
                      <p className={`
                        mb-2 text-sm text-gray-600
                        dark:text-gray-400
                      `}>
                        请使用认证应用扫描二维码，然后输入验证码
                      </p>
                      <p className={`
                        rounded bg-gray-100 p-2 font-mono text-xs text-gray-500
                        dark:bg-gray-700 dark:text-gray-400
                      `}>
                        手动输入密钥: {twoFactorStatus.secret}
                      </p>
                    </div>
                    <button
                      className={`
                        rounded-lg bg-green-600 px-4 py-2 text-white
                        hover:bg-green-700
                        disabled:cursor-not-allowed disabled:opacity-50
                      `}
                      disabled={twoFactorStatus.loading}
                      onClick={handleVerifyTwoFactor}
                    >
                      {twoFactorStatus.loading ? "验证中..." : "验证并启用"}
                    </button>
                  </div>
                )}

                {twoFactorStatus.enabled && (
                  <button
                    className={`
                      rounded-lg bg-red-600 px-4 py-2 text-white
                      hover:bg-red-700
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                    disabled={twoFactorStatus.loading}
                    onClick={handleDisableTwoFactor}
                  >
                    {twoFactorStatus.loading ? "禁用中..." : "禁用双因素认证"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
