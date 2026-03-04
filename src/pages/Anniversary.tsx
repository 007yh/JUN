import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Plus, Gift, Trash2 } from 'lucide-react';
import { ClayButton } from '../components/ui/ClayButton';
import { useAppStore } from '../store/appStore';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';
import { differenceInDays, parseISO, addYears, setYear, isBefore } from 'date-fns';
import { Lunar } from 'lunar-javascript';

export default function Anniversary() {
  const { anniversaries, addAnniversary, deleteAnniversary } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLunar, setIsLunar] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    let lunarMonth: number | undefined;
    let lunarDay: number | undefined;

    if (isLunar) {
      const solarDate = parseISO(date);
      const lunar = Lunar.fromDate(solarDate);
      lunarMonth = lunar.getMonth();
      lunarDay = lunar.getDay();
    }

    addAnniversary({
      title,
      date,
      type: 'anniversary',
      isLunar,
      lunarMonth,
      lunarDay,
    });
    setTitle('');
    setIsLunar(false);
    setIsModalOpen(false);
  };

  const calculateDays = (anniversary: { date: string; isLunar?: boolean; lunarMonth?: number; lunarDay?: number }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { date: targetDateStr, isLunar: isLunarType, lunarMonth, lunarDay } = anniversary;

    let targetDate: Date;
    let displayText = '';

    if (isLunarType) {
      // Handle Lunar Date
      const [_, monthFallback, dayFallback] = targetDateStr.split('-').map(Number);
      const month = lunarMonth ?? monthFallback;
      const day = lunarDay ?? dayFallback;
      const currentYear = today.getFullYear();
      
      // Get Lunar date for current year
      let lunarDate = Lunar.fromYmd(currentYear, month, day);
      let solarDate = lunarDate.getSolar();
      let targetSolar = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
      
      // If this year's lunar date has passed, use next year's
      if (isBefore(targetSolar, today)) {
         lunarDate = Lunar.fromYmd(currentYear + 1, month, day);
         solarDate = lunarDate.getSolar();
         targetSolar = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
      }
      
      targetDate = targetSolar;
      displayText = `农历 ${month}月${day}日`;
    } else {
      // Handle Solar Date (Annual recurrence)
      // Assuming anniversaries/birthdays recur annually
      const parsedDate = parseISO(targetDateStr);
      let nextOccurrence = setYear(parsedDate, today.getFullYear());
      
      if (isBefore(nextOccurrence, today)) {
        nextOccurrence = addYears(nextOccurrence, 1);
      }
      targetDate = nextOccurrence;
      displayText = targetDateStr;
    }

    const diff = differenceInDays(targetDate, today);
    return { diff, displayText };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Mobile-like header action */}
      <div className="fixed bottom-24 right-6 z-40 md:static md:mb-8 md:flex md:justify-end">
        <ClayButton 
          size="lg" 
          className="rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg md:w-auto md:h-auto md:px-6 md:py-2 md:rounded-xl" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={24} />
          <span className="hidden md:inline ml-2">新增纪念日</span>
        </ClayButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {anniversaries.map((anniversary) => {
          const { diff, displayText } = calculateDays(anniversary);
          
          return (
            <ClayCard key={anniversary.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gift size={100} />
              </div>
              <button 
                onClick={() => deleteAnniversary(anniversary.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                  {anniversary.title}
                  {anniversary.isLunar && <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded">农</span>}
                </h3>
                <p className="text-4xl font-black text-primary my-4">
                  {diff} 
                  <span className="text-base font-normal text-gray-500 ml-1">
                    天后
                  </span>
                </p>
                <p className="text-sm text-gray-400">目标日期: {displayText}</p>
              </div>
            </ClayCard>
          );
        })}

        <ClayCard 
          className="flex items-center justify-center min-h-[160px] border-2 border-dashed border-gray-200 bg-transparent hover:bg-white/30 cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
            <Plus size={32} className="mb-2" />
            <span>添加新的纪念日</span>
          </div>
        </ClayCard>
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="添加纪念日"
      >
        <div className="space-y-4">
          <ClayInput
            label="纪念日名称"
            placeholder="例如：宝宝生日"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="flex items-center gap-4 mb-2">
             <label className="text-sm font-medium text-gray-700">日期类型</label>
             <div className="flex gap-4">
               <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                 <input 
                   type="radio" 
                   name="dateType" 
                   checked={!isLunar} 
                   onChange={() => setIsLunar(false)}
                   className="text-primary focus:ring-primary"
                 />
                 公历
               </label>
               <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                 <input 
                   type="radio" 
                   name="dateType" 
                   checked={isLunar} 
                   onChange={() => setIsLunar(true)}
                   className="text-primary focus:ring-primary"
                 />
                 农历
               </label>
             </div>
          </div>

          <ClayInput
            type="date"
            label={isLunar ? "选择农历日期 (转换后)" : "选择日期"}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {isLunar && (
             <p className="text-xs text-gray-400 mt-1 ml-1">
               请在日历中选择对应的公历日期，系统会自动转换为农历每年重复
             </p>
          )}
          <ClayButton fullWidth onClick={handleSubmit}>
            确认添加
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
}
