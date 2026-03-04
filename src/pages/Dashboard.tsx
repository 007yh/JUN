import React, { useState, useEffect, useRef } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Heart, Calendar, Edit2, Clock, X, Plus, User as UserIcon, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { ClayCalendar } from '../components/ui/ClayCalendar';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { differenceInDays, parseISO } from 'date-fns';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';
import { ClayButton } from '../components/ui/ClayButton';
import { NavLink } from 'react-router-dom';
import { Lunar } from 'lunar-javascript';

export default function Dashboard() {
  const { startDate, setStartDate, anniversaries, timelineEvents, coverPhotos, addCoverPhoto, removeCoverPhoto } = useAppStore();
  const { user, partner, invitationCode, checkInvitationCode, generateInvitationCode, bindPartner, unbindPartner } = useAuthStore();
  
  const [daysTogether, setDaysTogether] = useState(0);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [isUnbindModalOpen, setIsUnbindModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [inputCode, setInputCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate days together
  useEffect(() => {
    const start = parseISO(startDate);
    const today = new Date();
    setDaysTogether(differenceInDays(today, start));
  }, [startDate]);

  // Check code expiry and generate on mount if needed
  useEffect(() => {
    checkInvitationCode();
    if (!invitationCode) {
      generateInvitationCode();
    }
  }, [invitationCode, generateInvitationCode, checkInvitationCode]);

  // Periodic check for code expiry (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      checkInvitationCode();
      if (!useAuthStore.getState().invitationCode) {
          generateInvitationCode();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [checkInvitationCode, generateInvitationCode]);

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleBind = () => {
    bindPartner(inputCode).then((ok) => {
      if (ok) {
        alert('绑定成功！账号数据已同步。');
        setIsBindModalOpen(false);
      } else {
        alert('绑定码无效、已过期、已被使用，或该空间已满员。');
      }
    });
  };

  const handleUnbind = () => {
      unbindPartner();
      setIsUnbindModalOpen(false);
      alert('已解除绑定关系');
  };

  // Find next anniversary
  const getNextAnniversary = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let nextAnniversary = null;
    let minDiff = Infinity;

    anniversaries.forEach(ann => {
      let targetDate: Date;

      if (ann.isLunar) {
        const fallbackParts = ann.date.split('-').map(Number);
        const lunarMonth = ann.lunarMonth ?? fallbackParts[1];
        const lunarDay = ann.lunarDay ?? fallbackParts[2];
        let lunar = Lunar.fromYmd(currentYear, lunarMonth, lunarDay);
        let solar = lunar.getSolar();
        targetDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());

        if (differenceInDays(targetDate, today) < 0) {
          lunar = Lunar.fromYmd(currentYear + 1, lunarMonth, lunarDay);
          solar = lunar.getSolar();
          targetDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
        }
      } else {
        const dateParts = ann.date.split('-');
        targetDate = new Date(currentYear, parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        if (differenceInDays(targetDate, today) < 0) {
          targetDate = new Date(currentYear + 1, parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        }
      }

      const diff = differenceInDays(targetDate, today);
      if (diff < minDiff) {
        minDiff = diff;
        nextAnniversary = { ...ann, daysLeft: diff };
      }
    });

    return nextAnniversary;
  };

  const nextAnniversary = getNextAnniversary();

  // Latest updates (timeline)
  const latestEvents = timelineEvents.slice(0, 5); // Get last 5 events

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 relative min-h-screen">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column: Stats & Calendar */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Couple Binding / Days Together Card */}
            <ClayCard className="relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-100 rounded-full opacity-50" />
               <div className="relative z-10 flex flex-col items-center justify-center py-4">
                 
                 {/* Avatars Row */}
                 <div className="flex items-center gap-6 mb-4">
                    {/* Me */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-gray-400" size={32} />
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 max-w-[5rem] truncate text-center">{user?.name || '我'}</span>
                    </div>

                    {/* Heart / Connection */}
                    <div className="flex flex-col items-center">
                       {partner ? (
                         <div className="w-12 h-12 text-red-500 animate-pulse">
                           <Heart fill="currentColor" size={48} />
                         </div>
                       ) : (
                         <div className="w-10 h-10 text-gray-300">
                           <Heart size={40} />
                         </div>
                       )}
                    </div>

                    {/* Partner / Add */}
                    <div className="flex flex-col items-center gap-2">
                      {partner ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-1 shadow-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsUnbindModalOpen(true)}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                              {partner.avatar ? (
                                <img src={partner.avatar} alt="Partner" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="text-gray-400" size={32} />
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{partner.name}</span>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => setIsBindModalOpen(true)}
                            className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-pink-50 transition-all shadow-sm"
                          >
                            <Plus size={32} />
                          </button>
                          <span className="text-sm font-medium text-gray-400">邀请另一半</span>
                        </>
                      )}
                    </div>
                 </div>

                 {/* Status Text / Days Count */}
                 {partner ? (
                   <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsDateModalOpen(true)}>
                     <p className="text-gray-500 text-sm mb-1">我们已经相爱</p>
                     <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-black text-primary drop-shadow-sm">{daysTogether}</span>
                        <span className="text-gray-500 font-medium">天</span>
                     </div>
                     <p className="text-xs text-gray-400 mt-2">起始日: {startDate} <Edit2 size={10} className="inline ml-1" /></p>
                   </div>
                 ) : (
                   <div className="text-center">
                     <p className="text-gray-500 font-medium">快去邀请TA加入吧！</p>
                     <p className="text-xs text-gray-400 mt-1">绑定后开启甜蜜记录</p>
                   </div>
                 )}

               </div>
            </ClayCard>
    
            {/* Today's Memory/Event Card */}
            <ClayCard className="relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
               <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-500 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">今日纪念</h2>
                </div>
                {nextAnniversary ? (
                  <>
                    <p className="text-gray-600 font-medium text-lg">
                      距离 <span className="text-primary font-bold">{nextAnniversary.title}</span> 还有
                    </p>
                    <p className="text-3xl font-black text-blue-500 mt-2">
                      {nextAnniversary.daysLeft} <span className="text-sm font-normal text-gray-400">天</span>
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 font-medium text-lg">暂无即将到来的纪念日</p>
                )}
              </div>
            </ClayCard>
          </div>

          {/* Calendar Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              甜蜜日历
            </h2>
            <ClayCalendar />
          </div>
        </div>

        {/* Right Column: Quick Actions / Highlights */}
        <div className="space-y-6">
          <ClayCard className="relative overflow-hidden group h-[400px] flex flex-col">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex-shrink-0">
               <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 text-green-500 rounded-xl">
                  <Clock size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">最新动态</h2>
              </div>
            </div>
            
            {/* Scrollable Timeline Feed */}
            <div className="relative z-10 flex-1 overflow-hidden mask-linear-fade">
              <div className="space-y-4 animate-scroll-vertical hover:pause-scroll">
                {latestEvents.length > 0 ? (
                  [...latestEvents, ...latestEvents].map((event, idx) => (
                    <div key={`${event.id}-${idx}`} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
                      <p className="text-gray-700 text-sm line-clamp-3">"{event.content}"</p>
                      <p className="text-xs text-gray-400 mt-2 text-right">{event.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10">暂无动态，快去记录吧！</p>
                )}
              </div>
            </div>
             
             <NavLink to="/timeline" className="text-primary text-sm font-medium hover:underline mt-4 flex-shrink-0 relative z-10 inline-block">
              查看更多动态 &rarr;
            </NavLink>
          </ClayCard>

          {/* Floating Cover Photos Display (In Flow) */}
          <div className="relative h-64 w-full flex items-end justify-center pb-4">
            <div className="relative flex items-end">
              {coverPhotos.map((photo, index) => {
                // Calculate stagger styles
                // Index 0: Rotate -6deg, X: 0
                // Index 1: Rotate 4deg, X: -20px
                // Index 2: Rotate -3deg, X: -40px
                const rotations = ['-rotate-6', 'rotate-6', '-rotate-3'];
                // Adjust X offsets to prevent overflow and center the stack
                // Center photo (index 0) at 0
                // Left photo (index 1) at -15%
                // Right photo (index 2) at 15% (if present)
                
                // Let's rethink the stacking to be centered and spread slightly
                // If 1 photo: Center
                // If 2 photos: Leftish, Rightish
                // If 3 photos: Left, Center, Right (New Request)
                
                // User wants: "Left, Middle, Right" layout for 3 photos.
                // Let's use absolute positioning relative to center for the stack.
                
                let xClass = 'translate-x-0';
                let zClass = 'z-10';
                let rotateClass = rotations[index % 3];
                
                if (coverPhotos.length === 1) {
                    xClass = 'translate-x-0';
                    zClass = 'z-20';
                } else if (coverPhotos.length === 2) {
                    if (index === 0) { xClass = '-translate-x-8'; zClass = 'z-20'; rotateClass = '-rotate-6'; }
                    if (index === 1) { xClass = 'translate-x-8'; zClass = 'z-30'; rotateClass = 'rotate-6'; }
                } else if (coverPhotos.length === 3) {
                     // 3 Photos: Left, Center, Right
                     if (index === 0) { xClass = '-translate-x-20'; zClass = 'z-10'; rotateClass = '-rotate-6'; } // Left
                     if (index === 1) { xClass = 'translate-x-0'; zClass = 'z-20'; rotateClass = 'rotate-0'; }   // Center (Middle uploaded 2nd?) 
                     // Actually, index order is upload order. 0->1->2.
                     // User said: "Adding 3rd photo... show on right side".
                     // So:
                     // 1st (index 0): Left (-rotate)
                     // 2nd (index 1): Center (straight)
                     // 3rd (index 2): Right (rotate)
                     
                     // Wait, previous logic was stacking right-to-left.
                     // Let's just fix positions based on index for 3 items.
                     if (index === 0) { xClass = '-translate-x-16'; zClass = 'z-10'; rotateClass = '-rotate-6'; }
                     if (index === 1) { xClass = 'translate-x-0'; zClass = 'z-20'; rotateClass = 'rotate-3'; }
                     if (index === 2) { xClass = 'translate-x-16'; zClass = 'z-30'; rotateClass = 'rotate-6'; }
                }

                return (
                  <div 
                    key={index}
                    className={`absolute bottom-0 w-28 h-40 md:w-32 md:h-44 bg-white p-2 shadow-clay-card rounded-xl transform transition-transform hover:scale-110 hover:z-50 duration-300 origin-bottom group ${rotateClass} ${xClass} ${zClass}`}
                    style={{ left: '50%', marginLeft: '-4rem' }} // Center base
                  >
                     <img src={photo} alt={`Cover ${index}`} className="w-full h-full object-cover rounded-lg" />
                     <button 
                       onClick={() => removeCoverPhoto(index)}
                       className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 z-50"
                     >
                       <X size={16} />
                     </button>
                  </div>
                );
              })}

              {/* Add Button Logic */}
              {/* 
                 0 Photos: Center
                 1 Photo: Right of it? Or Left? User said "Plus also moves... Left, Middle, Right"
                 Let's place Plus button dynamically.
              */}
              {coverPhotos.length < 3 && (
                <div 
                  className={`absolute bottom-0 z-40 transition-all duration-300`}
                  style={{ 
                    left: '50%', 
                    transform: coverPhotos.length === 0 ? 'translateX(-50%)' : 
                               coverPhotos.length === 1 ? 'translateX(60px)' : // Right of 1st
                               coverPhotos.length === 2 ? 'translateX(100px)' : 'translateX(0)' // Right of 2nd
                  }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleQuickUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 bg-white text-primary rounded-full shadow-clay-btn flex items-center justify-center hover:bg-primary hover:text-white active:scale-95 transition-all"
                    title="添加照片"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClayModal
        isOpen={isBindModalOpen}
        onClose={() => setIsBindModalOpen(false)}
        title="邀请另一半"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-500 mb-2">你的绑定码</p>
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
            <p className="text-xs text-gray-400 mt-2">将此绑定码发送给TA，输入后即可完成互绑</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或者</span>
            </div>
          </div>

          <div>
             <p className="text-gray-500 mb-2">输入对方绑定码</p>
             <div className="flex gap-2">
               <div className="flex-1">
                 <ClayInput 
                   placeholder="请输入 CJYH-XXXXXX"
                   value={inputCode}
                   onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                 />
               </div>
               <ClayButton onClick={handleBind} disabled={!inputCode.trim()}>
                 <LinkIcon size={18} className="mr-1" />
                 绑定
               </ClayButton>
             </div>
          </div>
        </div>
      </ClayModal>

      <ClayModal
        isOpen={isUnbindModalOpen}
        onClose={() => setIsUnbindModalOpen(false)}
        title="解除绑定"
      >
        <div className="space-y-4 text-center">
            <p className="text-gray-600">确定要解除与 <span className="font-bold text-primary">{partner?.name}</span> 的绑定关系吗？</p>
            <p className="text-xs text-gray-400">解除后，双方将无法查看对方的动态，且需要重新绑定。</p>
            <div className="flex gap-4 mt-4">
                <ClayButton fullWidth variant="secondary" onClick={() => setIsUnbindModalOpen(false)}>取消</ClayButton>
                <ClayButton fullWidth className="bg-red-500 hover:bg-red-600 text-white" onClick={handleUnbind}>确认解除</ClayButton>
            </div>
        </div>
      </ClayModal>

      <ClayModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        title="设置恋爱开始日期"
      >
        <div className="space-y-4">
          <ClayInput 
            type="date"
            label="开始日期"
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
          />
          <ClayButton fullWidth onClick={() => {
            setStartDate(tempStartDate);
            setIsDateModalOpen(false);
          }}>
            保存设置
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
}
