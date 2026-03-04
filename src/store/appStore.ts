import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { savePhotoToFile } from '../utils/fileSystem';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface TimelineEvent {
  id: string;
  content: string;
  date: string;
  images: string[];
}

export interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: 'anniversary' | 'birthday' | 'other';
  isLunar?: boolean; // New field for Lunar date support
  lunarMonth?: number;
  lunarDay?: number;
}

export interface Hobby {
  id: string;
  name: string;
  icon: string;
  owner: 'me' | 'partner';
  description?: string;
}

export interface CalendarNote {
  date: string; // YYYY-MM-DD
  content: string;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: 'work' | 'off'; // 班 | 休
}

export interface AlbumPhoto {
  id: string;
  url: string;
  note: string;
  date: string;
}

interface AppState {
  timelineEvents: TimelineEvent[];
  anniversaries: Anniversary[];
  hobbies: Hobby[];
  calendarNotes: CalendarNote[];
  dayStatuses: DayStatus[];
  startDate: string; // YYYY-MM-DD
  photos: AlbumPhoto[];
  coverPhotos: string[]; // For Dashboard cover photos
  themeColor: string; // New theme color preference
  
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  deleteTimelineEvent: (id: string) => void;
  addAnniversary: (anniversary: Omit<Anniversary, 'id'>) => void;
  addHobby: (hobby: Omit<Hobby, 'id'>) => void;
  updateHobby: (id: string, updates: Partial<Hobby>) => void;
  deleteHobby: (id: string) => void;
  deleteAnniversary: (id: string) => void;
  updateCalendarNote: (date: string, content: string) => void;
  updateDayStatus: (date: string, status: 'work' | 'off' | null) => void;
  setStartDate: (date: string) => void;
  addPhoto: (photo: Omit<AlbumPhoto, 'id'>) => void;
  updatePhotoNote: (id: string, note: string) => void;
  deletePhoto: (id: string) => void;
  addCoverPhoto: (url: string) => void;
  removeCoverPhoto: (index: number) => void;
  setThemeColor: (color: string) => void; // New action
  
  // Sync Actions
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      startDate: '2023-01-01', // Default start date
      themeColor: 'bg-background', // Default theme class or color code. Using 'bg-background' as placeholder for now, or we can use specific hex/class.
                                   // Actually, let's store it as a predefined color key: 'pink', 'blue', 'purple', etc.
      
      timelineEvents: [
        {
          id: '1',
          content: '今天一起去看了最新的漫威电影，虽然剧情一般，但是和你在一起就很开心！爆米花很好吃~',
          date: '2023-05-20',
          images: [],
        }
      ],
      anniversaries: [
        {
          id: '1',
          title: '相识一周年',
          date: '2024-05-20',
          type: 'anniversary',
        }
      ],
      hobbies: [
        { id: '1', name: '摄影', icon: '📷', owner: 'me' },
        { id: '2', name: '游戏', icon: '🎮', owner: 'me' },
        { id: '3', name: '绘画', icon: '🎨', owner: 'partner' },
        { id: '4', name: '烹饪', icon: '🍳', owner: 'partner' },
      ],
      calendarNotes: [],
      dayStatuses: [],
      photos: [],
      coverPhotos: [],

      addTimelineEvent: (event) => set((state) => ({
        timelineEvents: [{ ...event, id: Date.now().toString() }, ...state.timelineEvents]
      })),
      
      deleteTimelineEvent: (id) => set((state) => ({
        timelineEvents: state.timelineEvents.filter(e => e.id !== id)
      })),
      
      addAnniversary: (anniversary) => set((state) => ({
        anniversaries: [...state.anniversaries, { ...anniversary, id: Date.now().toString() }]
      })),
      
      addHobby: (hobby) => set((state) => ({
        hobbies: [...state.hobbies, { ...hobby, id: Date.now().toString() }]
      })),
      
      updateHobby: (id, updates) => set((state) => ({
        hobbies: state.hobbies.map(h => h.id === id ? { ...h, ...updates } : h)
      })),

      deleteHobby: (id) => set((state) => ({
        hobbies: state.hobbies.filter(h => h.id !== id)
      })),
      
      deleteAnniversary: (id) => set((state) => ({
        anniversaries: state.anniversaries.filter(a => a.id !== id)
      })),

      updateCalendarNote: (date, content) => set((state) => {
        const existingIndex = state.calendarNotes.findIndex(n => n.date === date);
        if (existingIndex >= 0) {
          if (!content.trim()) {
            // Remove note if empty
            return {
              calendarNotes: state.calendarNotes.filter(n => n.date !== date)
            };
          }
          // Update existing
          const newNotes = [...state.calendarNotes];
          newNotes[existingIndex] = { date, content };
          return { calendarNotes: newNotes };
        } else {
           if (!content.trim()) return state;
           // Add new
           return {
             calendarNotes: [...state.calendarNotes, { date, content }]
           };
        }
      }),

      updateDayStatus: (date, status) => set((state) => {
        const existingIndex = state.dayStatuses.findIndex(s => s.date === date);
        if (existingIndex >= 0) {
          if (!status) {
            // Remove status
            return {
              dayStatuses: state.dayStatuses.filter(s => s.date !== date)
            };
          }
          // Update existing
          const newStatuses = [...state.dayStatuses];
          newStatuses[existingIndex] = { date, status };
          return { dayStatuses: newStatuses };
        } else {
           if (!status) return state;
           // Add new
           return {
             dayStatuses: [...state.dayStatuses, { date, status }]
           };
        }
      }),

      setStartDate: (date) => set({ startDate: date }),

      addPhoto: (photo) => {
        // Try to save to file system if possible (and if it's a base64 string)
        if (photo.url.startsWith('data:image')) {
          const fileName = `photo_${Date.now()}.jpg`;
          savePhotoToFile(photo.url, fileName).then((savedUri) => {
             // If successful, we could store the URI, but for now we keep the base64/url 
             // in state for PWA compatibility. 
             // Ideally: store both or prefer URI on native.
             // For this demo, we just ensure it's saved to the folder as requested.
             console.log('Backed up photo to:', savedUri);
          });
        }
        
        set((state) => ({
          photos: [{ ...photo, id: Date.now().toString() }, ...state.photos]
        }));
      },

      updatePhotoNote: (id, note) => set((state) => ({
        photos: state.photos.map(p => p.id === id ? { ...p, note } : p)
      })),

      deletePhoto: (id) => set((state) => ({
        photos: state.photos.filter(p => p.id !== id)
      })),

      addCoverPhoto: (url) => set((state) => {
        if (state.coverPhotos.length >= 3) return state;
        return { coverPhotos: [...state.coverPhotos, url] };
      }),
      removeCoverPhoto: (index) => set((state) => ({
        coverPhotos: state.coverPhotos.filter((_, i) => i !== index)
      })),
      
      setThemeColor: (color) => set({ themeColor: color }),

      syncToCloud: async () => {
        const state = get();
        const code = useAuthStore.getState().spaceCode;
        if (!code) {
          throw new Error('未设置空间码，无法同步到云端');
        }
        
        // Get user info from auth store local storage (since we can't access hook directly here easily without circular dep, 
        // but we can read localStorage persistence)
        let userInfo = null;
        try {
            const authStorage = localStorage.getItem('cjyh-auth-storage');
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                if (parsed.state && parsed.state.user) {
                    userInfo = parsed.state.user;
                }
            }
        } catch (e) {
            console.error('Failed to read auth info for sync', e);
        }

        const dataToSync = {
          timelineEvents: state.timelineEvents,
          anniversaries: state.anniversaries,
          hobbies: state.hobbies,
          calendarNotes: state.calendarNotes,
          dayStatuses: state.dayStatuses,
          photos: state.photos,
          startDate: state.startDate,
          themeColor: state.themeColor,
          // Add user info to the sync payload.
          // We will store a list of users who have synced to this space.
          // The backend (or next sync) will merge this.
          // Since we are overwriting 'data' field, we need to be careful.
          // Ideally, we should fetch first, merge users, then push.
          lastSyncedUser: userInfo
        };

        try {
          // First, fetch existing data to merge users list
          const { data: existingData } = await supabase
            .from('couple_spaces')
            .select('data')
            .eq('code', code)
            .single();
            
          let mergedUsers = [];
          if (existingData && existingData.data && existingData.data.users) {
              mergedUsers = existingData.data.users;
          }
          
          if (userInfo) {
              // Update or Add current user
              const existingUserIndex = mergedUsers.findIndex((u: any) => u.id === userInfo.id);
              if (existingUserIndex >= 0) {
                  mergedUsers[existingUserIndex] = userInfo;
              } else {
                  if (mergedUsers.length >= 2) {
                    throw new Error('该空间已达到两人上限，无法再加入新成员');
                  }
                  mergedUsers.push(userInfo);
              }
          }

          const finalData = {
              ...dataToSync,
              users: mergedUsers
          };

          const { error } = await supabase
            .from('couple_spaces')
            .upsert({ 
              code: code, 
              data: finalData,
              updated_at: new Date().toISOString()
            });
          
          if (error) throw error;
          console.log('Synced to cloud successfully');
        } catch (err) {
          console.error('Cloud sync failed:', err);
          throw err;
        }
      },

      syncFromCloud: async () => {
        const code = useAuthStore.getState().spaceCode;
        if (!code) {
          throw new Error('未设置空间码，无法从云端恢复');
        }
        
        try {
          const { data, error } = await supabase
            .from('couple_spaces')
            .select('*')
            .eq('code', code)
            .single();

          if (error) {
             if (error.code === 'PGRST116') {
               // No data found (new space), maybe auto-create?
               // For now, do nothing, keep local data.
               return;
             }
             throw error;
          }

          if (data && data.data) {
            // Merge or Replace? 
            // For simplicity in this "Sync" model, Cloud is Truth.
            // We replace local state with cloud state.
            const cloudData = data.data as Partial<AppState> & { users?: any[] };
            
            set({
              timelineEvents: cloudData.timelineEvents || [],
              anniversaries: cloudData.anniversaries || [],
              hobbies: cloudData.hobbies || [],
              calendarNotes: cloudData.calendarNotes || [],
              dayStatuses: cloudData.dayStatuses || [],
              photos: cloudData.photos || [],
              startDate: cloudData.startDate || '2023-01-01',
              themeColor: cloudData.themeColor || 'default',
            });
            
            // Handle User Sync (Update Partner Info in Auth Store)
            if (cloudData.users && Array.isArray(cloudData.users)) {
                try {
                    const authState = useAuthStore.getState();
                    const currentUserId = authState.user?.id;
                        
                    // Find the other user
                    const partnerUser = cloudData.users.find((u: any) => u.id !== currentUserId);
                        
                    if (partnerUser) {
                      const newPartner = {
                        id: partnerUser.id,
                        name: partnerUser.name,
                        avatar: partnerUser.avatar,
                        isOnline: true,
                        lastActive: new Date().toISOString()
                      };
                      useAuthStore.setState({ partner: newPartner });
                    } else {
                      useAuthStore.setState({ partner: null });
                    }
                } catch (e) {
                    console.error('Failed to sync partner info', e);
                }
            }
            console.log('Synced from cloud successfully');
          }
        } catch (err) {
          console.error('Fetch from cloud failed:', err);
          throw err;
        }
      }
    }),
    {
      name: 'cjyh-app-storage',
    }
  )
);
