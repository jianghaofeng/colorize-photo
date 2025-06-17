"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("Settings");
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
        console.error(`${t('profileForm.fetchProfileFailed')}:`, error);
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
      console.error(`${t('profileForm.fetchProfileFailed')}:`, error);
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

      setMessage({ text: t('profileForm.profileUpdateSuccess'), type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error(`${t('profileForm.updateFailed')}:`, error);
      setMessage({ text: error.message || t('profileForm.updateFailed'), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: t('passwordForm.passwordMismatch'), type: "error" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: t('passwordForm.passwordMinLength'), type: "error" });
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

      setMessage({ text: t('passwordForm.passwordChangeSuccess'), type: "success" });
      setPasswordData({
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (error: any) {
      console.error(`${t('passwordForm.passwordChangeFailed')}:`, error);
      setMessage({
        text: error.message || t('passwordForm.passwordChangeFailed'),
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
      setMessage({ text: t('securitySettings.scanQrCode'), type: "success" });
    } catch (error: any) {
      console.error(`${t('securitySettings.enableFailed')}:`, error);
      setMessage({ text: error.message || t('securitySettings.enableFailed'), type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // 禁用双因素认证
  const handleDisableTwoFactor = async () => {
    const password = prompt(t('securitySettings.enterPassword'));
    if (!password) return;

    setTwoFactorStatus((prev) => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.disable({ password });
      setTwoFactorStatus({ enabled: false, loading: false });
      setMessage({ text: t('securitySettings.twoFactorDisabled'), type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error(`${t('securitySettings.disableFailed')}:`, error);
      setMessage({ text: error.message || t('securitySettings.disableFailed'), type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // 验证双因素认证
  const handleVerifyTwoFactor = async () => {
    const code = prompt(t('securitySettings.enterVerificationCode'));
    if (!code) return;

    setTwoFactorStatus((prev) => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.verify({ code, factorId: twoFactorStatus.secret! });
      setTwoFactorStatus({ enabled: true, loading: false });
      setMessage({ text: t('securitySettings.twoFactorEnabled'), type: "success" });
      await fetchProfile();
    } catch (error: any) {
      console.error(`${t('securitySettings.verificationFailed')}:`, error);
      setMessage({ text: error.message || t('securitySettings.verificationFailed'), type: "error" });
      setTwoFactorStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`
          h-64 animate-pulse rounded-lg bg-muted
          dark:bg-muted
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
                border border-green-200 bg-green-100/30 text-green-700
                dark:border-green-800 dark:bg-green-900/30 dark:text-green-400
              `
              : `
                border border-red-200 bg-red-100/30 text-red-700
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
        rounded-lg border border-border bg-background shadow-sm
        dark:border-border dark:bg-background
      `}>
        <div className={`
          border-b border-border
          dark:border-border
        `}>
          <nav className="flex space-x-8 px-6">
            {[
              { key: "profile", label: t('tabs.profile') },
              { key: "password", label: t('tabs.password') },
              { key: "security", label: t('tabs.security') },
            ].map((tab) => (
              <button
                className={`
                  border-b-2 px-1 py-4 text-sm font-medium
                  ${activeSection === tab.key
                    ? `
                      border-primary text-primary
                      dark:border-primary dark:text-primary
                    `
                    : `
                      border-transparent text-muted-foreground
                      hover:border-border hover:text-foreground
                      dark:text-muted-foreground dark:hover:border-border
                      dark:hover:text-foreground
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                type="button"
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
                mb-6 text-lg font-semibold text-foreground
                dark:text-foreground
              `}>
                {t('profileSettings')}
              </h3>
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div className={`
                  grid grid-cols-1 gap-6
                  md:grid-cols-2
                `}>
                  <div>
                    <label
                      className={`
                        mb-2 block text-sm font-medium text-foreground
                        dark:text-foreground
                      `}
                      htmlFor="email">
                      {t('profileForm.email')}
                    </label>
                    <input
                      className={`
                        w-full cursor-not-allowed rounded-lg border
                        border-input bg-muted px-3 py-2
                        dark:border-input dark:bg-muted dark:text-muted-foreground
                      `}
                      disabled
                      type="email"
                      value={profile?.email || ""}
                    />
                    <p className={`
                      mt-1 text-xs text-muted-foreground
                      dark:text-muted-foreground
                    `}>
                      {t('profileForm.emailCannotBeChanged')}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`
                        mb-2 block text-sm font-medium text-foreground
                        dark:text-foreground
                      `}
                      htmlFor="name">
                      {t('profileForm.displayName')} *
                    </label>
                    <input
                      className={`
                        w-full rounded-lg border border-input px-3 py-2
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        dark:border-input dark:bg-background dark:text-foreground
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
                    <label
                      className={`
                        mb-2 block text-sm font-medium text-gray-700
                        dark:text-gray-300
                      `}
                      htmlFor="first-name">
                      {t('profileForm.firstName')}
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
                    <label
                      className={`
                        mb-2 block text-sm font-medium text-gray-700
                        dark:text-gray-300
                      `}
                      htmlFor="last-name">
                      {t('profileForm.lastName')}
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
                    <label
                      className={`
                        mb-2 block text-sm font-medium text-gray-700
                        dark:text-gray-300
                      `}
                      htmlFor="age">
                      {t('profileForm.age')}
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
                    {saving ? t('profileForm.saving') : t('profileForm.saveChanges')}
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
                {t('passwordForm.title')}
              </h3>
              <form className="space-y-6" onSubmit={handleChangePassword}>
                <div>
                  <label
                    className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}
                    htmlFor="current-password">
                    {t('passwordForm.currentPassword')}
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
                  <label
                    className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}
                    htmlFor="new-password">
                    {t('passwordForm.newPassword')}
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
                    {t('passwordForm.passwordMinLengthHint')}
                  </p>
                </div>

                <div>
                  <label
                    className={`
                      mb-2 block text-sm font-medium text-gray-700
                      dark:text-gray-300
                    `}
                    htmlFor="confirm-password">
                    {t('passwordForm.confirmPassword')}
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
                    {changingPassword ? t('passwordForm.changing') : t('passwordForm.changePassword')}
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
                {t('securitySettings.title')}
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
                      {t('securitySettings.emailVerification')}
                    </h4>
                    <p className={`
                      text-sm text-gray-600
                      dark:text-gray-400
                    `}>
                      {t('securitySettings.emailVerificationDesc')}
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
                    {profile?.emailVerified ? t('securitySettings.verified') : t('securitySettings.unverified')}
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
                      {t('securitySettings.twoFactorAuth')}
                    </h4>
                    <p className={`
                      text-sm text-gray-600
                      dark:text-gray-400
                    `}>
                      {t('securitySettings.twoFactorAuthDesc')}
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
                    {twoFactorStatus.enabled ? t('securitySettings.enabled') : t('securitySettings.disabled')}
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
                    type="button"
                  >
                    {twoFactorStatus.loading ? t('securitySettings.setting') : t('securitySettings.enableTwoFactor')}
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
                        {t('securitySettings.scanQrCodeInstructions')}
                      </p>
                      <p className={`
                        rounded bg-gray-100 p-2 font-mono text-xs text-gray-500
                        dark:bg-gray-700 dark:text-gray-400
                      `}>
                        {t('securitySettings.manualKey')}: {twoFactorStatus.secret}
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
                      type="button"
                    >
                      {twoFactorStatus.loading ? t('securitySettings.verifying') : t('securitySettings.verifyAndEnable')}
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
                    type="button"
                  >
                    {twoFactorStatus.loading ? t('securitySettings.disabling') : t('securitySettings.disableTwoFactor')}
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
