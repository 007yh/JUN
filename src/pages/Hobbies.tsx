import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { ClayButton } from '../components/ui/ClayButton';
import { useAppStore } from '../store/appStore';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';

export default function Hobbies() {
  const { hobbies, addHobby, deleteHobby, updateHobby } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('❤️');
  const [owner, setOwner] = useState<'me' | 'partner'>('me');
  const [description, setDescription] = useState('');

  const openAddModal = (targetOwner: 'me' | 'partner') => {
    setEditingId(null);
    setOwner(targetOwner);
    setName('');
    setIcon('❤️');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (hobby: any) => {
    setEditingId(hobby.id);
    setName(hobby.name);
    setIcon(hobby.icon);
    setOwner(hobby.owner);
    setDescription(hobby.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      updateHobby(editingId, {
        name,
        icon,
        owner,
        description
      });
    } else {
      addHobby({
        name,
        icon,
        owner,
        description
      });
    }
    
    setIsModalOpen(false);
  };

  const myHobbies = hobbies.filter(h => h.owner === 'me');
  const partnerHobbies = hobbies.filter(h => h.owner === 'partner');

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">兴趣爱好</h1>
        <ClayButton size="sm" className="flex items-center gap-2" onClick={() => openAddModal('me')}>
          <Plus size={18} />
          <span>添加爱好</span>
        </ClayButton>
      </div>

      <div className="space-y-12">
        {/* My Hobbies */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            我的爱好
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {myHobbies.map(hobby => (
               <ClayCard key={hobby.id} className="relative group hover:scale-[1.02] transition-transform duration-300">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-pink-50 text-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                     {hobby.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-gray-800 text-lg truncate">{hobby.name}</h3>
                     <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[2.5em]">
                       {hobby.description || '暂无描述，点击编辑添加...'}
                     </p>
                   </div>
                 </div>
                 
                 {/* Actions Overlay */}
                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1">
                   <button 
                     onClick={() => openEditModal(hobby)}
                     className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                     title="编辑"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                     onClick={() => deleteHobby(hobby.id)}
                     className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                     title="删除"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               </ClayCard>
             ))}
             
             {/* Add Card */}
             <button 
               onClick={() => openAddModal('me')}
               className="h-full min-h-[120px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-pink-50/50 transition-all gap-2 group"
             >
               <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                 <Plus size={24} />
               </div>
               <span className="font-medium">添加新爱好</span>
             </button>
          </div>
        </section>

        {/* Partner Hobbies */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            TA的爱好
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {partnerHobbies.map(hobby => (
               <ClayCard key={hobby.id} className="relative group hover:scale-[1.02] transition-transform duration-300">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                     {hobby.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-gray-800 text-lg truncate">{hobby.name}</h3>
                     <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[2.5em]">
                       {hobby.description || '暂无描述...'}
                     </p>
                   </div>
                 </div>
                 
                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1">
                   <button 
                     onClick={() => openEditModal(hobby)}
                     className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                     onClick={() => deleteHobby(hobby.id)}
                     className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               </ClayCard>
             ))}
             
             <button 
               onClick={() => openAddModal('partner')}
               className="h-full min-h-[120px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-secondary hover:text-secondary hover:bg-blue-50/50 transition-all gap-2 group"
             >
               <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                 <Plus size={24} />
               </div>
               <span className="font-medium">帮TA添加</span>
             </button>
          </div>
        </section>
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? '编辑爱好' : `添加${owner === 'me' ? '我的' : 'TA的'}爱好`}
      >
        <div className="space-y-6">
          {/* Multi-dimensional-like Form */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
            
            {/* Row 1: Name & Icon */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">爱好名称</label>
                <ClayInput
                  placeholder="例如：摄影"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">图标</label>
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-200 text-2xl shadow-sm">
                  {icon}
                </div>
              </div>
            </div>

            {/* Row 2: Icon Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">选择图标</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['❤️', '📷', '🎮', '🎨', '🍳', '🏃', '🎵', '📚', '✈️', '🐶', '🏊', '🚴', '🎹', '🎬', '👕', '👗', '🧥', '👖', '👟', '👠', '👢', '🧢', '👓', '👜', '💄', '💅', '🛍️', '⛺', '🎣', '⛳'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl transition-all ${
                      icon === emoji ? 'bg-primary text-white shadow-md scale-110' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Description (Text Area) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">详细描述 / 备注</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="记录一下这个爱好的小细节..."
                className="w-full h-24 p-3 rounded-xl border-none bg-white focus:ring-2 focus:ring-primary/50 transition-all resize-none text-gray-700 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Row 4: Owner Toggle (If needed to switch) */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-gray-600 ml-1">归属对象</span>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setOwner('me')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${owner === 'me' ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`}
                >
                  我
                </button>
                <button 
                  onClick={() => setOwner('partner')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${owner === 'partner' ? 'bg-secondary text-white shadow-sm' : 'text-gray-500'}`}
                >
                  TA
                </button>
              </div>
            </div>

          </div>

          <ClayButton fullWidth onClick={handleSubmit}>
            {editingId ? '保存修改' : '确认添加'}
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
}
