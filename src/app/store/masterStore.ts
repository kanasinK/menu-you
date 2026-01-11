import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MasterData, MasterItem } from '@/types';
import { masterRepo } from '@/lib/dataRepo';
import { MasterApiService } from '@/lib/api/masterApi';

interface MasterStore {
  masters: MasterData;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  // Actions
  loadMasters: () => Promise<void>;
  saveMasters: (masters: MasterData) => Promise<void>;
  refreshMasters: () => Promise<void>;

  // Selectors
  getById: (type: keyof MasterData, id: string) => MasterItem | undefined;
  getOptionsForSelect: (type: keyof MasterData) => Array<{
    value: string;
    label: string;
    code: string;
    hexCode?: string;
    imageUrls?: string | string[];
  }>;
  getByCode: (type: keyof MasterData, code: string) => MasterItem | undefined;
  getActiveItems: (type: keyof MasterData) => MasterItem[];
}

export const useMasterStore = create<MasterStore>()(
  devtools(
    (set, get) => ({
      masters: {
        serviceTypes: [],
        themes: [],
        colors: [],
        products: [],
        sizes: [],
        orientations: [],
        pageOptions: [],
        imageOptions: [],
        brandOptions: [],
        materials: [],
        coatings: [],
        equipments: [],
        roles: [],
        status: [],
        paymentStatus: [],
        itemTypes: [],
        itemSizes: [],
        itemLayouts: [],
        itemTextures: [],
        itemSides: [],
        itemImages: [],
        itemDecorates: [],
        itemMaterials: [],
        itemToolTypes: [],
        productCategories: [],
        toolTypes: [],
      },
      isLoading: false,
      isLoaded: false,
      error: null,

      loadMasters: async () => {
        const { isLoading, isLoaded } = get();
        if (isLoading || isLoaded) return;

        set({ isLoading: true, error: null });
        try {
          // พยายามดึงข้อมูลจาก Supabase ก่อน
          try {
            const masters = await MasterApiService.getAllMasters();
            set({ masters, isLoading: false, isLoaded: true });
            return;
          } catch (supabaseError) {
            console.warn('Failed to load from Supabase, falling back to localStorage:', supabaseError);
          }

          // Fallback ไปใช้ localStorage
          const masters = masterRepo.getAll();
          set({ masters, isLoading: false, isLoaded: true });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load masters',
            isLoading: false,
            isLoaded: true
          });
        }
      },

      saveMasters: async (masters: MasterData) => {
        set({ isLoading: true, error: null });
        try {
          // บันทึกลง localStorage เป็น fallback
          masterRepo.save(masters);
          set({ masters, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to save masters',
            isLoading: false
          });
        }
      },

      refreshMasters: async () => {
        set({ isLoading: true, error: null });
        try {
          const masters = await MasterApiService.getAllMasters();
          set({ masters, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh masters',
            isLoading: false
          });
        }
      },

      getById: (type: keyof MasterData, id: string) => {
        const { masters } = get();
        const items = masters[type];
        if (!items || !Array.isArray(items)) {
          return undefined;
        }
        return items.find((item: MasterItem) => item.id === id);
      },

      getOptionsForSelect: (type: keyof MasterData) => {
        const { masters } = get();
        const items = masters[type];
        if (!items || !Array.isArray(items)) {
          return [];
        }
        return items
          .filter((item: MasterItem) => item.isActive)
          .map((item: MasterItem) => ({
            value: item.id,
            label: item.name,
            code: item.code,
            ...(type === 'colors' && { hexCode: (item as any).hexCode }),
            ...(type === 'themes' && { imageUrls: (item as any).imageUrls }),
            ...(type === 'colors' && { imageUrls: (item as any).imageUrls }),
          }));
      },

      getByCode: (type: keyof MasterData, code: string) => {
        const { masters } = get();
        const items = masters[type];
        if (!items || !Array.isArray(items)) {
          return undefined;
        }
        return items.find((item: MasterItem) => item.code === code);
      },

      getActiveItems: (type: keyof MasterData) => {
        const { masters } = get();
        const items = masters[type];
        if (!items || !Array.isArray(items)) {
          return [];
        }
        return items.filter((item: MasterItem) => item.isActive);
      },
    }),
    {
      name: 'master-store',
    }
  )
);

// Initialize store
if (typeof window !== 'undefined') {
  useMasterStore.getState().loadMasters();
}