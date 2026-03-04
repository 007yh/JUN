import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDate
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Gift, Bell, Briefcase, Palmtree } from 'lucide-react';
import { ClayCard } from './ClayCard';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';
import { ClayModal } from './ClayModal';
import { ClayButton } from './ClayButton';
import { Lunar, Solar, HolidayUtil } from 'lunar-javascript';

export const ClayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { anniversaries, calendarNotes, dayStatuses, updateCalendarNote, updateDayStatus } = useAppStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingNote = calendarNotes.find(n => n.date === dateStr);
    setNoteContent(existingNote?.content || '');
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      updateCalendarNote(dateStr, noteContent);
      setIsModalOpen(false);
    }
  };

  const handleStatusChange = (status: 'work' | 'off' | null) => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      updateDayStatus(dateStr, status);
    }
  };

  const getDayInfo = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const shortDateStr = format(day, 'MM-dd');
    
    // 1. Lunar & Solar Terms
    const lunarDate = Lunar.fromDate(day);
    const solarDate = Solar.fromDate(day);
    const solarTerm = lunarDate.getJieQi(); // Solar Term (e.g. 'Lichun')
    const lunarDayStr = lunarDate.getDayInChinese();
    const lunarMonthStr = lunarDate.getMonthInChinese();
    
    // Get Festivals
    let festival = '';
    
    // 1.1 Custom Lunar Festivals (Little New Year)
    const lm = lunarDate.getMonth();
    const ld = lunarDate.getDay();
    if (lm === 12 && ld === 23) festival = '北方小年';
    else if (lm === 12 && ld === 24) festival = '南方小年';
    
    // 1.2 Solar Festivals (Valentine's, etc.)
    if (!festival) {
      const solarFestivals = solarDate.getFestivals();
      for (const f of solarFestivals) {
        if (['情人节', '妇女节', '植树节', '消费者权益日', '愚人节', '劳动节', '青年节', '儿童节', '建党节', '建军节', '教师节', '国庆节', '圣诞节', '元旦', '万圣节', '感恩节'].includes(f)) {
          festival = f;
          break;
        }
      }
    }

    // 1.3 Lunar Festivals (Standard)
    if (!festival) {
      const lunarFestivals = lunarDate.getFestivals();
      if (lunarFestivals.length > 0) {
        festival = lunarFestivals[0];
      }
    }
    
    // 2. Official Holidays (from lunar-javascript or custom override)
    // Note: HolidayUtil.getHoliday(dateStr) returns holiday info if exists
    const officialHoliday = HolidayUtil.getHoliday(dateStr);
    
    // 3. User Custom Status
    const customStatus = dayStatuses.find(s => s.date === dateStr)?.status;
    
    // Determine Work/Off status
    let isWork = false;
    let isOff = false;
    let holidayName = '';

    if (customStatus) {
      isWork = customStatus === 'work';
      isOff = customStatus === 'off';
    } else if (officialHoliday) {
      isWork = officialHoliday.isWork();
      isOff = !isWork;
      holidayName = officialHoliday.getName();
    }

    // Display Name Priority: Festival (Custom/Solar/Lunar) > Official Holiday Name > Solar Term > Lunar Day
    // User requested specifically to see "Little New Year" etc instead of generic holiday names if they conflict
    let display = festival;
    
    if (!display) {
        if (holidayName) display = holidayName;
        else if (solarTerm) display = solarTerm;
        else {
            display = lunarDayStr;
            // If it's the first day of lunar month, show month name
            if (lunarDate.getDay() === 1) display = lunarMonthStr + '月';
        }
    }

    const anniversary = anniversaries.find(a => {
       return a.date.endsWith(shortDateStr);
    });
    const note = calendarNotes.find(n => n.date === dateStr);
    
    return { 
      lunarDisplay: display, 
      holidayName, 
      isWork, 
      isOff, 
      anniversary, 
      note,
      customStatus 
    };
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={prevMonth} className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-600">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentDate, 'yyyy年 MM月', { locale: zhCN })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-600">
          <ChevronRight size={20} />
        </button>
      </div>

      <ClayCard className="p-4 !rounded-[32px]">
        {/* Week Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, idx) => (
            <div key={day} className={cn(
              "text-center text-sm font-medium py-2",
              idx >= 5 ? "text-primary" : "text-gray-400"
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const { lunarDisplay, holidayName, isWork, isOff, anniversary, note } = getDayInfo(day);

            return (
              <div 
                key={day.toISOString()} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square relative flex flex-col items-center justify-start pt-1.5 rounded-2xl transition-all cursor-pointer group",
                  !isCurrentMonth && "opacity-30 grayscale",
                  isToday && "bg-primary/10",
                  !isToday && isCurrentMonth && "hover:bg-gray-50",
                  "border-2 border-transparent hover:border-primary/20"
                )}
              >
                {/* Work/Off Badge */}
                {isOff && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] leading-none bg-green-100 text-green-600 px-1 py-0.5 rounded-md">休</span>
                )}
                {isWork && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] leading-none bg-red-100 text-red-600 px-1 py-0.5 rounded-md">班</span>
                )}

                <span className={cn(
                  "text-sm font-medium z-10",
                  isToday ? "text-primary" : "text-gray-700",
                  (isOff || holidayName) && "text-green-600"
                )}>
                  {getDate(day)}
                </span>
                
                {/* Lunar / Info */}
                <span className={cn(
                  "text-[9px] truncate w-full text-center leading-tight mt-0.5",
                  (holidayName || isOff) ? "text-green-500 font-medium" : "text-gray-400"
                )}>
                  {lunarDisplay}
                </span>

                {/* Event Indicators */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {anniversary && (
                     <Gift size={10} className="text-primary animate-bounce-slow" />
                  )}
                  {note && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ClayCard>

      {/* Note Modal */}
      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDate ? format(selectedDate, 'MM月dd日 详情', { locale: zhCN }) : '备注'}
      >
        <div className="space-y-4">
           {selectedDate && (() => {
             const { holidayName, lunarDisplay, anniversary, customStatus } = getDayInfo(selectedDate);
             return (
               <div className="space-y-3">
                 <div className="bg-pink-50 p-4 rounded-xl text-sm space-y-2">
                   <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                      <span className="text-lg font-bold text-gray-800">{format(selectedDate, 'yyyy年MM月dd日')}</span>
                      <span className="text-gray-500">农历 {lunarDisplay}</span>
                   </div>
                   
                   {anniversary && (
                     <div className="font-bold flex items-center gap-2 text-primary">
                       <Gift size={16}/> 
                       <span>纪念日: {anniversary.title}</span>
                     </div>
                   )}
                   
                   {holidayName && (
                     <div className="font-bold text-green-600">
                       节日: {holidayName}
                     </div>
                   )}
                 </div>

                 {/* Work/Off Status Toggle */}
                 <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium ml-2">设置状态:</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(customStatus === 'work' ? null : 'work')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1",
                          customStatus === 'work' 
                            ? "bg-red-500 text-white shadow-clay-btn" 
                            : "bg-white text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <Briefcase size={14} />
                        补班
                      </button>
                      <button 
                        onClick={() => handleStatusChange(customStatus === 'off' ? null : 'off')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1",
                          customStatus === 'off' 
                            ? "bg-green-500 text-white shadow-clay-btn" 
                            : "bg-white text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <Palmtree size={14} />
                        休假
                      </button>
                    </div>
                 </div>
               </div>
             );
           })()}

           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-700 ml-1">当日备注</label>
             <textarea
               className="w-full rounded-2xl bg-white/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-clay-inset border-none outline-none ring-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200 min-h-[100px]"
               placeholder="今天有什么特别安排吗？"
               value={noteContent}
               onChange={(e) => setNoteContent(e.target.value)}
             />
           </div>
           
           <div className="flex justify-end gap-2">
             <ClayButton variant="ghost" onClick={() => setIsModalOpen(false)}>取消</ClayButton>
             <ClayButton onClick={handleSaveNote}>保存修改</ClayButton>
           </div>
        </div>
      </ClayModal>
    </div>
  );
};
