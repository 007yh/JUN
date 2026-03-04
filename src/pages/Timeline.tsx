import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { ClayButton } from '../components/ui/ClayButton';
import { useAppStore } from '../store/appStore';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';

export default function Timeline() {
  const { timelineEvents, addTimelineEvent, deleteTimelineEvent } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    addTimelineEvent({
      content: newContent,
      date: newDate,
      images: []
    });
    setNewContent('');
    setIsModalOpen(false);
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
          <span className="hidden md:inline ml-2">添加记录</span>
        </ClayButton>
      </div>
      
      <div className="space-y-6 pt-2">
        {timelineEvents.map((event) => (
          <ClayCard key={event.id} className="flex flex-col gap-4 relative group">
            <button 
              onClick={() => deleteTimelineEvent(event.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
               <span className="font-bold text-lg text-gray-800">美好时刻</span>
               <span className="text-sm text-gray-400">{event.date}</span>
            </div>
            <p className="text-gray-600 whitespace-pre-wrap">
              {event.content}
            </p>
            {event.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {event.images.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <img src={img} alt="memory" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </ClayCard>
        ))}

        {timelineEvents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">暂无更多回忆，快去创造吧！</p>
          </div>
        )}
      </div>

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="记录美好瞬间"
      >
        <div className="space-y-4">
          <ClayInput 
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            label="日期"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1">内容</label>
            <textarea
              className="w-full rounded-2xl bg-white/50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-clay-inset border-none outline-none ring-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200 min-h-[120px]"
              placeholder="发生了什么有趣的事情？"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>
          <ClayButton fullWidth onClick={handleSubmit}>
            保存回忆
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
}
