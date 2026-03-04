import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  avatar?: string;
  isActivated: boolean;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

interface Partner {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastActive?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  partner: Partner | null;
  spaceCode: string | null;
  invitationCode: string | null;
  invitationCodeExpiry: number | null; // Timestamp
  activityLogs: ActivityLog[];
  
  login: (user: User) => void;
  setSpaceCode: (code: string) => void;
  syncUserProfileToCloud: () => Promise<void>;
  refreshPartnerFromCloud: () => Promise<void>;
  logout: () => void;
  generateInvitationCode: () => Promise<void>;
  checkInvitationCode: () => void; // Check expiry
  bindPartner: (code: string) => Promise<boolean>;
  unbindPartner: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearAllData: () => void;
  addLog: (action: string, details?: string) => void;
  setPartnerOnline: (isOnline: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      partner: null,
      spaceCode: null,
      invitationCode: null,
      invitationCodeExpiry: null,
      activityLogs: [],

      login: (user) => {
        set({ isAuthenticated: true, user });
        get().addLog('登录', '访问了应用');
        void get().syncUserProfileToCloud();
      },

      setSpaceCode: (code) => {
        const normalized = code.trim().toUpperCase();
        set({ spaceCode: normalized });
      },

      syncUserProfileToCloud: async () => {
        const { user, spaceCode } = get();
        if (!user || !spaceCode) return;

        try {
          const { data: spaceRow, error: fetchError } = await supabase
            .from('couple_spaces')
            .select('data')
            .eq('code', spaceCode)
            .maybeSingle();
          if (fetchError) throw fetchError;

          const currentData = (spaceRow?.data || {}) as any;
          const users = Array.isArray(currentData.users) ? [...currentData.users] : [];
          const userIndex = users.findIndex((u: any) => u.id === user.id);
          if (userIndex < 0 && users.length >= 2) {
            throw new Error('该空间已达到两人上限');
          }
          if (userIndex >= 0) {
            users[userIndex] = user;
          } else {
            users.push(user);
          }

          const finalData = {
            ...currentData,
            users,
          };

          const { error: upsertError } = await supabase
            .from('couple_spaces')
            .upsert({
              code: spaceCode,
              data: finalData,
              updated_at: new Date().toISOString(),
            });
          if (upsertError) throw upsertError;
        } catch (e) {
          console.error('Failed to sync user profile to cloud:', e);
        }
      },

      refreshPartnerFromCloud: async () => {
        const { user, spaceCode } = get();
        if (!user || !spaceCode) return;

        try {
          const { data: spaceRow, error } = await supabase
            .from('couple_spaces')
            .select('data')
            .eq('code', spaceCode)
            .maybeSingle();
          if (error) throw error;

          const users = Array.isArray(spaceRow?.data?.users) ? spaceRow.data.users : [];
          const partnerUser = users.find((u: any) => u.id !== user.id);

          if (partnerUser) {
            set({
              partner: {
                id: partnerUser.id,
                name: partnerUser.name || '亲爱的TA',
                avatar: partnerUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                isOnline: true,
                lastActive: new Date().toISOString(),
              },
            });
          }
        } catch (e) {
          console.error('Failed to refresh partner from cloud:', e);
        }
      },
      
      logout: () => {
        get().addLog('退出', '退出了登录');
        // Only clear authentication status, keep user and partner data for quick resume
        set({ isAuthenticated: false });
      },

      generateInvitationCode: async () => {
        const { user, spaceCode } = get();
        if (!user || !spaceCode) return;

        const code = 'CJYH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiry = Date.now() + 3 * 60 * 60 * 1000; // 3 hours from now
        try {
          const { error } = await supabase
            .from('invitation_codes')
            .insert({
              code,
              space_code: spaceCode,
              created_by: user.id,
              expires_at: new Date(expiry).toISOString(),
            });

          if (error) throw error;

          set({ invitationCode: code, invitationCodeExpiry: expiry });
          get().addLog('生成绑定码', '生成了新的绑定码');
        } catch (e) {
          console.error('Failed to generate invitation code:', e);
        }
      },

      checkInvitationCode: () => {
        const { invitationCodeExpiry } = get();
        if (invitationCodeExpiry && Date.now() > invitationCodeExpiry) {
          set({ invitationCode: null, invitationCodeExpiry: null });
        }
      },

      bindPartner: async (code) => {
        const normalized = code.trim().toUpperCase();
        const {
          spaceCode,
          partner,
          user,
        } = get();

        const isInviteCode = /^CJYH-[A-Z0-9]{6}$/.test(normalized);

        if (partner) {
          return true;
        }

        if (!isInviteCode || !spaceCode || !user) {
          return false;
        }

        try {
          // Hard guard: this space can only have two members.
          const { data: spaceRow, error: spaceCheckError } = await supabase
            .from('couple_spaces')
            .select('data')
            .eq('code', spaceCode)
            .maybeSingle();
          if (spaceCheckError) throw spaceCheckError;

          const existingUsers = Array.isArray(spaceRow?.data?.users) ? spaceRow.data.users : [];
          const isCurrentUserKnown = existingUsers.some((u: any) => u.id === user.id);
          if (!isCurrentUserKnown && existingUsers.length >= 2) {
            return false;
          }

          const nowIso = new Date().toISOString();
          const { data, error } = await supabase
            .from('invitation_codes')
            .update({
              consumed_at: nowIso,
              consumed_by: user.id,
            })
            .eq('code', normalized)
            .eq('space_code', spaceCode)
            .is('consumed_at', null)
            .gt('expires_at', nowIso)
            .select('created_by')
            .maybeSingle();

          if (error) throw error;
          if (!data) return false;

          let partnerName = '亲爱的TA';
          let partnerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

          // Try to resolve partner profile from synced cloud users in the same space.
          const { data: latestSpaceRow, error: spaceError } = await supabase
            .from('couple_spaces')
            .select('data')
            .eq('code', spaceCode)
            .maybeSingle();

          if (!spaceError && latestSpaceRow?.data?.users && Array.isArray(latestSpaceRow.data.users)) {
            const partnerUser = latestSpaceRow.data.users.find((u: any) => u.id === data.created_by);
            if (partnerUser) {
              partnerName = partnerUser.name || partnerName;
              partnerAvatar = partnerUser.avatar || partnerAvatar;
            }
          }

          set({
            partner: {
              id: data.created_by || 'partner-1',
              name: partnerName,
              avatar: partnerAvatar,
              isOnline: true,
              lastActive: new Date().toISOString()
            }
          });
          get().addLog('绑定伴侣', '成功绑定了另一半');
          return true;
        } catch (e) {
          console.error('Failed to bind partner with invitation code:', e);
          return false;
        }
      },

      unbindPartner: () => {
        const partnerName = get().partner?.name || 'TA';
        set({ partner: null });
        get().addLog('解除绑定', `解除了与 ${partnerName} 的绑定关系`);
      },
      
      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          return { user: updatedUser };
        });
        
        // Log specific updates
        if (updates.name) get().addLog('修改昵称', `昵称修改为: ${updates.name}`);
        if (updates.avatar) get().addLog('修改头像', '更新了个人头像');
        void get().syncUserProfileToCloud();
      },

      clearAllData: () => {
        // Only clear app-owned keys to avoid breaking unrelated apps on same origin.
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('cjyh-') || key === 'theme') {
            localStorage.removeItem(key);
          }
        });
        
        // Reset state immediately
        set({ 
          isAuthenticated: false, 
          user: null, 
          partner: null, 
          spaceCode: null,
          invitationCode: null,
          invitationCodeExpiry: null,
          activityLogs: []
        });

        // Use a slight timeout to allow state to settle before reload, 
        // though reload usually handles this. 
        // Crucially, we want to make sure the app re-initializes from a clean slate.
        setTimeout(() => {
             window.location.reload(); 
        }, 100);
      },

      addLog: (action, details) => {
        const { user, activityLogs } = get();
        if (!user) return;
        
        // Generate a more unique ID using timestamp + random suffix + user ID prefix
        const uniqueId = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const newLog: ActivityLog = {
          id: uniqueId,
          userId: user.id,
          userName: user.name,
          action,
          details,
          timestamp: new Date().toISOString()
        };

        set({ activityLogs: [newLog, ...activityLogs].slice(0, 50) }); // Keep last 50 logs
      },

      setPartnerOnline: (isOnline) => {
        set((state) => ({
          partner: state.partner ? { ...state.partner, isOnline, lastActive: new Date().toISOString() } : null
        }));
      },

    }),
    {
      name: 'cjyh-auth-storage',
    }
  )
);
