import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ClaimOrder, ClaimOrderItem } from '@/types';
import { claimRepo, claimItemRepo } from '@/lib/dataRepo';

interface ClaimStore {
  claims: ClaimOrder[];
  claimItems: ClaimOrderItem[];
  selectedClaim: ClaimOrder | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadClaims: () => void;
  loadClaimItems: (claimId?: string) => void;
  selectClaim: (id: string | null) => void;
  createClaim: (claim: Omit<ClaimOrder, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<ClaimOrder>;
  updateClaim: (id: string, updates: Partial<ClaimOrder>) => Promise<ClaimOrder | null>;
  createClaimItem: (claimItem: Omit<ClaimOrderItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ClaimOrderItem>;
  updateClaimItem: (id: string, updates: Partial<ClaimOrderItem>) => Promise<ClaimOrderItem | null>;
  clearError: () => void;

  // Selectors
  getClaimsByOrderId: (orderId: string) => ClaimOrder[];
  getClaimItemsByClaimId: (claimId: string) => ClaimOrderItem[];
  getClaimById: (id: string) => ClaimOrder | undefined;
}

export const useClaimStore = create<ClaimStore>()(
  devtools(
    (set, get) => ({
      claims: [],
      claimItems: [],
      selectedClaim: null,
      isLoading: false,
      error: null,

      loadClaims: () => {
        set({ isLoading: true, error: null });
        try {
          const claims = claimRepo.getAll();
          set({ claims, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load claims',
            isLoading: false
          });
        }
      },

      loadClaimItems: (claimId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const claimItems = claimId
            ? claimItemRepo.getAll().filter(item => (item as any).claimId === claimId)
            : claimItemRepo.getAll();
          set({ claimItems, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load claim items',
            isLoading: false
          });
        }
      },

      selectClaim: (id: string | null) => {
        if (!id) {
          set({ selectedClaim: null });
          return;
        }

        const claim = claimRepo.getById(id);
        set({ selectedClaim: claim || null });

        // Load claim items for this claim
        if (claim) {
          get().loadClaimItems(String((claim as any).id ?? ''));
        }
      },

      createClaim: async (claimData) => {
        set({ isLoading: true, error: null });
        try {
          const newClaim = claimRepo.create(claimData);
          const { claims } = get();
          set({
            claims: [...claims, newClaim],
            selectedClaim: newClaim,
            isLoading: false
          });
          return newClaim;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create claim',
            isLoading: false
          });
          throw error;
        }
      },

      updateClaim: async (id: string, updates: Partial<ClaimOrder>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedClaim = claimRepo.update(id, updates);
          if (!updatedClaim) {
            throw new Error('Claim not found');
          }

          const { claims } = get();
          const updatedClaims = claims.map(claim =>
            String((claim as any).id ?? '') === id ? updatedClaim : claim
          );

          set({
            claims: updatedClaims,
            selectedClaim: updatedClaim,
            isLoading: false
          });
          return updatedClaim;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update claim',
            isLoading: false
          });
          throw error;
        }
      },

      createClaimItem: async (claimItemData) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();
          const newClaimItem: ClaimOrderItem = {
            ...(claimItemData as unknown as Partial<ClaimOrderItem>),
            id: Date.now().toString(),
            createdAt: now,
            updatedAt: now,
          } as unknown as ClaimOrderItem;
          const { claimItems } = get();
          set({
            claimItems: [...claimItems, newClaimItem],
            isLoading: false
          });
          return newClaimItem;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create claim item',
            isLoading: false
          });
          throw error;
        }
      },

      updateClaimItem: async (id: string, updates: Partial<ClaimOrderItem>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedClaimItem = claimItemRepo.update(id, updates);
          if (!updatedClaimItem) {
            throw new Error('Claim item not found');
          }

          const { claimItems } = get();
          const updatedClaimItems = claimItems.map(item =>
            String((item as any).id ?? '') === id ? updatedClaimItem : item
          );

          set({
            claimItems: updatedClaimItems,
            isLoading: false
          });
          return updatedClaimItem;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update claim item',
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getClaimsByOrderId: (orderId: string) => {
        const { claims } = get();
        return claims.filter(claim => String((claim as any).orderId ?? '') === orderId);
      },

      getClaimItemsByClaimId: (claimId: string) => {
        const { claimItems } = get();
        return claimItems.filter(item => item.claimId === claimId);
      },

      getClaimById: (id: string) => {
        const { claims } = get();
        return claims.find(claim => String(claim.id) === id);
      },
    }),
    {
      name: 'claim-store',
    }
  )
);

// Initialize store
if (typeof window !== 'undefined') {
  useClaimStore.getState().loadClaims();
  useClaimStore.getState().loadClaimItems();
}