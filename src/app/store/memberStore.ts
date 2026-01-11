import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Member } from '@/types';
import { getSupabase } from '@/lib/supabase';

interface MemberStore {
  members: Member[];
  selectedMember: Member | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMembers: () => Promise<void>;
  selectMember: (id: string | null) => void;
  createMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<boolean>;
  clearError: () => void;

  // Selectors
  getMemberById: (id: string) => Member | undefined;
  getMembersByRole: (roleCode: string) => Member[];
  getActiveMembersOptions: () => Array<{ value: string; label: string; }>;
}

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = getSupabase();
  if (!supabase) return { 'Content-Type': 'application/json' };

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export const useMemberStore = create<MemberStore>()(
  devtools(
    (set, get) => ({
      members: [],
      selectedMember: null,
      isLoading: false,
      error: null,

      loadMembers: async () => {
        set({ isLoading: true, error: null });
        try {
          const headers = await getAuthHeaders();
          const res = await fetch('/api/members', { headers });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to load members');
          }

          const members: Member[] = data.members.map((m: Record<string, unknown>) => ({
            id: m.id as number,
            userName: m.user_name as string,
            nickname: m.nickname as string | null,
            email: m.email as string | null,
            roleCode: m.role_code as string,
            status: m.status as boolean,
            password: m.password as string | null,
            createdAt: m.created_date as string,
            updatedAt: m.updated_date as string,
          }));
          set({ members, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load members',
            isLoading: false
          });
        }
      },

      selectMember: (id: string | null) => {
        if (!id) {
          set({ selectedMember: null });
          return;
        }
        const { members } = get();
        const member = members.find(m => String(m.id) === id);
        set({ selectedMember: member || null });
      },

      createMember: async (memberData) => {
        set({ isLoading: true, error: null });
        try {
          const headers = await getAuthHeaders();
          const res = await fetch('/api/members', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              user_name: memberData.userName,
              nickname: memberData.nickname,
              email: memberData.email,
              password: memberData.password,
              role_code: memberData.roleCode,
              status: memberData.status,
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to create member');
          }

          await get().loadMembers();

          const newMember: Member = {
            id: data.member.id,
            userName: data.member.user_name,
            nickname: data.member.nickname,
            email: data.member.email,
            roleCode: data.member.role_code,
            status: data.member.status,
            password: data.member.password,
            createdAt: data.member.created_date,
            updatedAt: data.member.updated_date,
          };

          set({ isLoading: false, selectedMember: newMember });
          return newMember;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create member',
            isLoading: false
          });
          throw error;
        }
      },

      updateMember: async (id: string, updates: Partial<Member>) => {
        set({ isLoading: true, error: null });
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/members/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              user_name: updates.userName,
              nickname: updates.nickname,
              email: updates.email,
              password: updates.password,
              role_code: updates.roleCode,
              status: updates.status,
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to update member');
          }

          await get().loadMembers();

          const updatedMember: Member = {
            id: data.member.id,
            userName: data.member.user_name,
            nickname: data.member.nickname,
            email: data.member.email,
            roleCode: data.member.role_code,
            status: data.member.status,
            password: data.member.password,
            createdAt: data.member.created_date,
            updatedAt: data.member.updated_date,
          };

          set({ isLoading: false, selectedMember: updatedMember });
          return updatedMember;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update member',
            isLoading: false
          });
          throw error;
        }
      },

      deleteMember: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/members/${id}`, {
            method: 'DELETE',
            headers,
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete member');
          }

          const { selectedMember } = get();
          await get().loadMembers();

          set({
            isLoading: false,
            selectedMember: String(selectedMember?.id) === id ? null : selectedMember
          });
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete member',
            isLoading: false
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getMemberById: (id: string) => {
        const { members } = get();
        return members.find(member => String(member.id) === id);
      },

      getMembersByRole: (roleCode: string) => {
        const { members } = get();
        return members.filter(member => member.roleCode === roleCode && member.status === true);
      },

      getActiveMembersOptions: () => {
        const { members } = get();
        return members
          .filter(member => member.status === true)
          .map(member => ({
            value: String(member.id),
            label: member.userName,
          }));
      },
    }),
    {
      name: 'member-store',
    }
  )
);

// Initialize store
if (typeof window !== 'undefined') {
  useMemberStore.getState().loadMembers();
}
