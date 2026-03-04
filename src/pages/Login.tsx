import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ClayCard } from '../components/ui/ClayCard';
import { ClayButton } from '../components/ui/ClayButton';
import { ClayInput } from '../components/ui/ClayInput';
import { KeyRound } from 'lucide-react';

export default function Login() {
  const { login, setSpaceCode } = useAuthStore();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const fixedAccessCode = (import.meta.env.VITE_ACCESS_CODE || 'JUN2026').trim().toUpperCase();

  const handleLogin = () => {
    const normalizedCode = inviteCode.trim().toUpperCase();
    if (!normalizedCode) {
      setError('请输入访问码');
      return;
    }
    if (normalizedCode !== fixedAccessCode) {
      setError('访问码错误');
      return;
    }

    const userId = localStorage.getItem('cjyh_user_id') || 'user-' + Date.now();
    localStorage.setItem('cjyh_user_id', userId);
    setSpaceCode(fixedAccessCode);

    login({
      id: userId,
      name: '我的爱人',
      isActivated: true,
      avatar: '',
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <ClayCard className="w-full max-w-md flex flex-col items-center p-10">
        <h1 className="text-4xl font-bold text-primary mb-2 tracking-wider">CJYH</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          记录属于你们的甜蜜时光
        </p>

        <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                 <KeyRound size={32} />
               </div>
               <h2 className="text-xl font-bold text-gray-800">请输入访问码</h2>
               <p className="text-sm text-gray-500 mt-1">仅授权用户可访问和互绑</p>
              </div>

            <ClayInput
              placeholder="请输入访问码"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setError('');
              }}
              error={error}
              icon={<KeyRound size={18} />}
              className="text-center tracking-widest text-lg"
              type="password"
            />

            <ClayButton 
              onClick={handleLogin}
              fullWidth
              size="lg"
              className="mt-4"
            >
              进入空间
            </ClayButton>
        </div>
      </ClayCard>
    </div>
  );
}
