import React, { useState, useRef, useEffect } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ClayButton } from '../components/ui/ClayButton';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, HeartHandshake, Share2, Camera, Edit2, Copy, Check, Trash2, User as UserIcon, History, Palette, Cloud, RefreshCw } from 'lucide-react';

// ...

export default function Profile() {
  const { user, partner, logout, updateUser, clearAllData, unbindPartner, bindPartner, invitationCode, generateInvitationCode, checkInvitationCode, activityLogs, setPartnerOnline } = useAuthStore();
  const { themeColor, setThemeColor, syncToCloud, syncFromCloud } = useAppStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ...

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncToCloud();
      alert('备份成功！数据已同步至云端。');
    } catch (e) {
      alert('同步失败，请检查网络、空间码或 Supabase 配置');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (window.confirm('确定要从云端恢复数据吗？这将覆盖当前本地数据。')) {
        setIsSyncing(true);
        try {
            await syncFromCloud();
            alert('从云端恢复成功！');
        } catch (e) {
            alert('恢复失败，请检查网络、空间码或 Supabase 配置');
        } finally {
            setIsSyncing(false);
        }
    }
  };

  // Simulate Partner Online Check on Mount
  useEffect(() => {
    if (partner) {
      // For demo: Always set partner online when viewing profile
      // In real app: This would be a socket subscription or API poll
      if (!partner.isOnline) {
          setPartnerOnline(true);
      }
    }
  }, [partner, setPartnerOnline]);

  // Modals state
  const [isRelationOpen, setIsRelationOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNameEditOpen, setIsNameEditOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Form state
  const [newName, setNewName] = useState(user?.name || '');
  const [bindCode, setBindCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setNewName(user?.name || '');
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image before saving
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          updateUser({ avatar: compressedDataUrl });
        };
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleNameSave = () => {
    if (newName.trim()) {
      updateUser({ name: newName });
      setIsNameEditOpen(false);
    }
  };

  const handleBind = () => {
    bindPartner(bindCode).then((ok) => {
      if (ok) {
        alert('绑定成功！');
        setBindCode('');
        setIsRelationOpen(false);
      } else {
        alert('绑定码无效、已过期、已被使用，或该空间已满员');
      }
    });
  };

  const handleUnbind = () => {
    if (window.confirm('确定要解除绑定吗？解除后数据将不再共享。')) {
      unbindPartner();
      setIsRelationOpen(false);
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenInvite = () => {
    checkInvitationCode();
    if (!invitationCode) {
      generateInvitationCode();
    }
    setIsInviteOpen(true);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有数据并重置应用吗？此操作无法撤销。')) {
      // 1. Clear Store Data
      clearAllData();
      
      // 2. Although clearAllData calls reload, we can double ensure navigation to root
      // But the reload is the key. The issue is likely that after reload, 
      // the App component might not be redirecting to Login if state is cleared but URL is still /profile.
      // However, App.tsx usually has a PrivateRoute. 
      // Let's make sure we navigate to login *before* or *during* the reset process if possible, 
      // OR rely on the reload + state clear to trigger the auth check.
      
      // Actually, if we reload, the app re-mounts.
      // If persisted state is gone, useAuthStore will initialize with isAuthenticated: false.
      // The router should see this and redirect to /.
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      {/* Mobile-like header action: None for profile, but maybe clean up title */}
      {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">个人中心</h1> */}
      
      <div className="space-y-6 pt-8">
        {/* User Info Card */}
        <ClayCard className="flex items-center gap-6 relative group">
          <div className="relative cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-gray-400" size={40} />
              )}
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <button 
                onClick={() => setIsNameEditOpen(true)}
                className="p-1 text-gray-400 hover:text-primary transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            {/* WeChat Binding Status - REMOVED */}
            {/* <div className="flex items-center gap-2 mt-1">
                {user?.wechatId ? (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MessageCircle size={10} /> 已绑定微信
                    </span>
                ) : (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                        未绑定微信
                    </span>
                )}
            </div> */}

            <p className="text-gray-500 text-sm mt-1">{partner ? `已绑定: ${partner.name}` : '未绑定另一半'}</p>
          </div>
        </ClayCard>

        {/* Menu Items */}
        <div className="space-y-4">
          <ClayCard className="!p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              <button 
                onClick={() => setIsRelationOpen(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <HeartHandshake size={20} className="text-primary" />
                  <span>情侣关系管理</span>
                </div>
                <span className="text-gray-400">&rsaquo;</span>
              </button>
              
              {!partner && (
              <button 
                onClick={handleOpenInvite}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Share2 size={20} className="text-blue-500" />
                  <span>生成绑定码</span>
                </div>
                <span className="text-gray-400">&rsaquo;</span>
              </button>
              )}

              <button 
                onClick={() => setIsLogsOpen(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <History size={20} className="text-purple-500" />
                  <span>操作记录</span>
                </div>
                <span className="text-gray-400">&rsaquo;</span>
              </button>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Settings size={20} className="text-gray-500" />
                  <span>通用设置</span>
                </div>
                <span className="text-gray-400">&rsaquo;</span>
              </button>
            </div>
          </ClayCard>
          
          <ClayButton 
            variant="ghost" 
            fullWidth 
            className="text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 justify-center"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </ClayButton>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Edit Name Modal */}
      <ClayModal
        isOpen={isNameEditOpen}
        onClose={() => setIsNameEditOpen(false)}
        title="修改昵称"
      >
        <div className="space-y-4">
          <ClayInput 
            label="昵称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="请输入新昵称"
          />
          <ClayButton fullWidth onClick={handleNameSave}>保存</ClayButton>
        </div>
      </ClayModal>

      {/* Relationship Modal */}
      <ClayModal
        isOpen={isRelationOpen}
        onClose={() => setIsRelationOpen(false)}
        title="情侣关系管理"
      >
        <div className="space-y-6">
          {partner ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full overflow-hidden border-2 border-pink-200">
                {partner.avatar ? (
                  <img src={partner.avatar} alt="Partner" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-gray-400 m-4" size={48} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{partner.name}</h3>
                <p className="text-gray-500 text-sm">当前绑定对象</p>
              </div>
              <ClayButton fullWidth className="bg-red-500 hover:bg-red-600 text-white" onClick={handleUnbind}>
                解除绑定
              </ClayButton>

              {/* Partner Status */}
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${partner.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                   <span className="text-sm font-medium text-gray-700">{partner.isOnline ? '当前在线' : '离线'}</span>
                </div>
                {partner.lastActive && (
                  <span className="text-xs text-gray-400">上次活跃: {new Date(partner.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-center text-sm">输入对方绑定码进行互绑</p>
              <ClayInput 
                placeholder="CJYH-XXXXXX"
                value={bindCode}
                onChange={(e) => setBindCode(e.target.value.toUpperCase())}
              />
              <ClayButton fullWidth onClick={handleBind} disabled={!bindCode.trim()}>
                立即绑定
              </ClayButton>
            </div>
          )}
        </div>
      </ClayModal>

      {/* Invite Code Modal */}
      <ClayModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="生成绑定码"
      >
        <div className="text-center space-y-4">
           <p className="text-gray-500 text-sm">将此代码发送给TA，有效期3小时</p>
           <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between border-2 border-dashed border-gray-300">
              <span className="text-2xl font-mono font-bold text-primary tracking-wider">{invitationCode || '生成中...'}</span>
              <button 
                onClick={handleCopyCode}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-primary"
                title="复制"
              >
                {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-red-400">注意：生成新绑定码后，旧码将立即失效</p>
            <ClayButton 
              variant="secondary" 
              fullWidth 
              onClick={generateInvitationCode}
            >
              刷新绑定码
            </ClayButton>
        </div>
      </ClayModal>

      {/* Settings Modal */}
      <ClayModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="通用设置"
      >
        <div className="space-y-6">
          {/* Theme Color Switcher */}
          <div>
             <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
               <Palette size={18} className="text-primary" /> 主题背景
             </h3>
             <div className="grid grid-cols-3 gap-3">
               {[
                 { id: 'default', name: '浪漫粉', color: 'bg-pink-100' },
                 { id: 'blue', name: '清新蓝', color: 'bg-blue-100' },
                 { id: 'purple', name: '梦幻紫', color: 'bg-purple-100' },
                 { id: 'green', name: '自然绿', color: 'bg-green-100' },
                 { id: 'yellow', name: '温暖黄', color: 'bg-yellow-100' },
                 { id: 'dark', name: '暗夜黑', color: 'bg-gray-800 text-white' },
               ].map((theme) => (
                 <button
                   key={theme.id}
                   onClick={() => setThemeColor(theme.id)}
                   className={`
                     p-3 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all
                     ${themeColor === theme.id ? 'border-primary shadow-md scale-105' : 'border-transparent hover:border-gray-200 bg-gray-50'}
                   `}
                 >
                   <div className={`w-8 h-8 rounded-full shadow-sm ${theme.color} border border-black/5`}></div>
                   <span className="text-xs font-medium text-gray-600">{theme.name}</span>
                 </button>
               ))}
             </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
             {/* Cloud Sync Section */}
             <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                   <Cloud size={18} className="text-blue-500" /> 云端同步 (Supabase)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <ClayButton 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                  >
                    {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <Cloud size={18} />}
                    <span className="ml-2">备份到云端</span>
                  </ClayButton>
                  
                  <ClayButton 
                    onClick={handleRestore} 
                    disabled={isSyncing}
                    className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                  >
                    <RefreshCw size={18} />
                    <span className="ml-2">从云端恢复</span>
                  </ClayButton>
                </div>

             </div>

             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
               <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                 <Trash2 size={18} /> 危险区域
               </h3>
               <p className="text-sm text-red-400 mb-4">清空所有本地缓存和数据，应用将重置为初始状态。</p>
               <ClayButton 
                 fullWidth 
                 className="bg-red-500 hover:bg-red-600 text-white border-none"
                 onClick={handleClearData}
               >
                 一键清空所有数据
               </ClayButton>
             </div>
          </div>
        </div>
      </ClayModal>

      {/* Activity Logs Modal */}
      <ClayModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        title="操作记录"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-sm">{log.action}</span>
                    <span className="text-xs text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  {log.details && <p className="text-xs text-gray-600">{log.details}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <History size={32} className="mx-auto mb-2 opacity-50" />
              <p>暂无操作记录</p>
            </div>
          )}
        </div>
      </ClayModal>
    </div>
  );
}
