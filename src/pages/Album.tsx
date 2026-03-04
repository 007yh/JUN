import React, { useState, useRef } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { ClayButton } from '../components/ui/ClayButton';
import { useAppStore } from '../store/appStore';
import { ClayModal } from '../components/ui/ClayModal';
import { ClayInput } from '../components/ui/ClayInput';

export default function Album() {
  const { photos, addPhoto, deletePhoto, updatePhotoNote } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPhoto({
          url: reader.result as string,
          note: '',
          date: new Date().toISOString().split('T')[0]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditNote = (photoId: string, currentNote: string) => {
    setSelectedPhoto(photoId);
    setPhotoNote(currentNote);
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (selectedPhoto) {
      updatePhotoNote(selectedPhoto, photoNote);
      setIsModalOpen(false);
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Mobile-like header action */}
      <div className="fixed bottom-24 right-6 z-40 md:static md:mb-8 md:flex md:justify-end">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <ClayButton 
            size="lg" 
            className="rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg md:w-auto md:h-auto md:px-6 md:py-2 md:rounded-xl" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} />
            <span className="hidden md:inline ml-2">上传合照</span>
          </ClayButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
        {photos.map((photo) => (
          <ClayCard key={photo.id} className="!p-3 relative group break-inside-avoid">
            <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 relative">
              <img src={photo.url} alt="memory" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => handleEditNote(photo.id, photo.note)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={() => deletePhoto(photo.id)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="px-1">
              <p className="text-xs text-gray-400 mb-1">{photo.date}</p>
              <p className="text-sm text-gray-700 font-medium truncate">{photo.note || "点击添加备注..."}</p>
            </div>
          </ClayCard>
        ))}

        {/* Upload Placeholder */}
        <ClayCard 
          className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-transparent hover:bg-white/30 cursor-pointer group gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-sm text-gray-400 group-hover:text-primary">上传新照片</span>
        </ClayCard>
      </div>

      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="编辑照片备注"
      >
        <div className="space-y-4">
          <ClayInput
            label="备注内容"
            placeholder="这张照片背后的故事..."
            value={photoNote}
            onChange={(e) => setPhotoNote(e.target.value)}
          />
          <ClayButton fullWidth onClick={handleSaveNote}>
            保存
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
}
