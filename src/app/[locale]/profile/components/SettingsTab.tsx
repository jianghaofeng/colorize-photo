'use client';

import { useEffect, useState } from 'react';
import { createClient } from '~/lib/supabase/client';
import { useSupabase } from '~/lib/supabase/SupabaseProvider';
import { twoFactor } from '~/lib/supabase-mfa';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  age: number | null;
  twoFactorEnabled: boolean | null;
  emailVerified: boolean;
}

interface FormData {
  name: string;
  firstName: string;
  lastName: string;
  age: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    firstName: '',
    lastName: '',
    age: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'security'>('profile');
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    qrCode?: string;
    secret?: string;
    loading: boolean;
  }>({ enabled: false, loading: false });
  
  const { user, supabase } = useSupabase();

  // 获取用户资料
  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('获取用户资料失败:', error);
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        age: data.age?.toString() || ''
      });
      setTwoFactorStatus(prev => ({ ...prev, enabled: data.twoFactorEnabled || false }));
    } catch (error) {
      console.error('获取用户资料失败:', error);
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
        name: formData.name,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        age: formData.age ? parseInt(formData.age) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // 同时更新 Supabase Auth 用户元数据
      await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: formData.name
        }
      });

      setMessage({ type: 'success', text: '个人资料更新成功！' });
      await fetchProfile();
    } catch (error: any) {
      console.error('更新用户资料失败:', error);
      setMessage({ type: 'error', text: error.message || '更新失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不匹配' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码长度至少为6位' });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: '密码修改成功！' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('修改密码失败:', error);
      setMessage({ type: 'error', text: error.message || '密码修改失败，请重试' });
    } finally {
      setChangingPassword(false);
    }
  };

  // 启用双因素认证
  const handleEnableTwoFactor = async () => {
    setTwoFactorStatus(prev => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      const result = await twoFactor.enroll();
      setTwoFactorStatus({
        enabled: false,
        qrCode: result.qrCode,
        secret: result.secret,
        loading: false
      });
      setMessage({ type: 'success', text: '请扫描二维码并输入验证码完成设置' });
    } catch (error: any) {
      console.error('启用双因素认证失败:', error);
      setMessage({ type: 'error', text: error.message || '启用失败，请重试' });
      setTwoFactorStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // 禁用双因素认证
  const handleDisableTwoFactor = async () => {
    const password = prompt('请输入您的密码以禁用双因素认证:');
    if (!password) return;

    setTwoFactorStatus(prev => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.disable({ password });
      setTwoFactorStatus({ enabled: false, loading: false });
      setMessage({ type: 'success', text: '双因素认证已禁用' });
      await fetchProfile();
    } catch (error: any) {
      console.error('禁用双因素认证失败:', error);
      setMessage({ type: 'error', text: error.message || '禁用失败，请重试' });
      setTwoFactorStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // 验证双因素认证
  const handleVerifyTwoFactor = async () => {
    const code = prompt('请输入6位验证码:');
    if (!code) return;

    setTwoFactorStatus(prev => ({ ...prev, loading: true }));
    setMessage(null);

    try {
      await twoFactor.verify({ code });
      setTwoFactorStatus({ enabled: true, loading: false });
      setMessage({ type: 'success', text: '双因素认证设置成功！' });
      await fetchProfile();
    } catch (error: any) {
      console.error('验证双因素认证失败:', error);
      setMessage({ type: 'error', text: error.message || '验证失败，请重试' });
      setTwoFactorStatus(prev => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab导航 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="border-b dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'profile', label: '个人资料' },
              { key: 'password', label: '密码设置' },
              { key: 'security', label: '安全设置' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.key
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeSection === 'profile' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-6 dark:text-white">个人资料</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">邮箱地址无法修改</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      显示名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      名字
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      姓氏
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      年龄
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      min="1"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '保存中...' : '保存更改'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-6 dark:text-white">修改密码</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    当前密码
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    新密码
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">密码长度至少为6位</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? '修改中...' : '修改密码'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="text-lg font-semibold dark:text-white">安全设置</h3>
              
              {/* 邮箱验证状态 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">邮箱验证</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">验证您的邮箱地址以提高账户安全性</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.emailVerified 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {profile?.emailVerified ? '已验证' : '未验证'}
                  </div>
                </div>
              </div>
              
              {/* 双因素认证 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">双因素认证 (2FA)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">为您的账户添加额外的安全保护</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    twoFactorStatus.enabled 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {twoFactorStatus.enabled ? '已启用' : '未启用'}
                  </div>
                </div>
                
                {!twoFactorStatus.enabled && !twoFactorStatus.qrCode && (
                  <button
                    onClick={handleEnableTwoFactor}
                    disabled={twoFactorStatus.loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFactorStatus.loading ? '设置中...' : '启用双因素认证'}
                  </button>
                )}
                
                {twoFactorStatus.qrCode && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img 
                        src={twoFactorStatus.qrCode} 
                        alt="2FA QR Code" 
                        className="mx-auto mb-4 dark:border dark:border-gray-600 dark:rounded"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        请使用认证应用扫描二维码，然后输入验证码
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        手动输入密钥: {twoFactorStatus.secret}
                      </p>
                    </div>
                    <button
                      onClick={handleVerifyTwoFactor}
                      disabled={twoFactorStatus.loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {twoFactorStatus.loading ? '验证中...' : '验证并启用'}
                    </button>
                  </div>
                )}
                
                {twoFactorStatus.enabled && (
                  <button
                    onClick={handleDisableTwoFactor}
                    disabled={twoFactorStatus.loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFactorStatus.loading ? '禁用中...' : '禁用双因素认证'}
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