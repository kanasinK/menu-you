import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Order, OrderQuery, PaginatedResponse } from '@/types';
import { orderRepo } from '@/lib/dataRepo';
import { OrderApiService } from '@/lib/api/orderApi';

interface OrderStore {
  orders: PaginatedResponse<Order> | null;
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  query: OrderQuery;
  statistics: {
    total: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
    totalAmount: number;
    recentOrders: Order[];
  } | null;
  
  // Actions
  loadOrders: (query?: Partial<OrderQuery>) => void;
  selectOrder: (id: string | null) => void;
  createOrder: (order: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  setQuery: (query: Partial<OrderQuery>) => void;
  loadStatistics: () => void;
  clearError: () => void;
  
  // Selectors
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  devtools(
    (set, get) => ({
      orders: null,
      selectedOrder: null,
      isLoading: false,
      error: null,
      query: {
        page: 1,
        size: 10,
      },
      statistics: null,
      
      loadOrders: async (queryUpdates = {}) => {
        set({ isLoading: true, error: null });
        try {
          const { query } = get();
          const newQuery = { ...query, ...queryUpdates } as OrderQuery;
          // พยายามโหลดจาก DB จริงผ่าน Supabase
          try {
            const orders = await OrderApiService.queryOrders(newQuery);
            set({ orders, query: newQuery, isLoading: false });
            return;
          } catch {
            // fallback ไป dataRepo (local)
          }
          const orders = orderRepo.query(newQuery);
          set({ orders, query: newQuery, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load orders',
            isLoading: false 
          });
        }
      },
      
      selectOrder: async (id: string | null) => {
        if (!id) {
          set({ selectedOrder: null });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          // ลองดึงจาก DB จริงก่อน
          try {
            const order = await OrderApiService.getOrderById(id);
            set({ selectedOrder: order || null, isLoading: false });
            return;
          } catch {
            // fallback
          }
          const order = orderRepo.getById(id);
          set({ selectedOrder: order || null, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load order',
            isLoading: false 
          });
        }
      },
      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          const newOrder = orderRepo.create(orderData);
          
          // Reload orders to reflect the new addition
          const { query } = get();
          const orders = orderRepo.query(query);
          
          set({ 
            orders, 
            selectedOrder: newOrder,
            isLoading: false 
          });
          return newOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create order',
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateOrder: async (id: string, updates: Partial<Order>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrder = orderRepo.update(id, updates);
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
          
          // Reload orders to reflect the update
          const { query } = get();
          const orders = orderRepo.query(query);
          
          set({ 
            orders,
            selectedOrder: updatedOrder,
            isLoading: false 
          });
          return updatedOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update order',
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const success = orderRepo.delete(id);
          if (!success) {
            throw new Error('Order not found');
          }
          
          // Reload orders to reflect the deletion
          const { query, selectedOrder } = get();
          const orders = orderRepo.query(query);
          
          set({ 
            orders,
            selectedOrder: selectedOrder?.id?.toString() === id ? null : selectedOrder,
            isLoading: false 
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete order',
            isLoading: false 
          });
          return false;
        }
      },
      
      setQuery: (queryUpdates: Partial<OrderQuery>) => {
        const { query } = get();
        const newQuery = { ...query, ...queryUpdates };
        set({ query: newQuery });
        get().loadOrders();
      },
      
      loadStatistics: () => {
        try {
          const statistics = orderRepo.getStatistics();
          set({ statistics });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load statistics'
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      getOrderById: (id: string) => {
        return orderRepo.getById(id);
      },
    }),
    {
      name: 'order-store',
    }
  )
);

// Initialize store
if (typeof window !== 'undefined') {
  useOrderStore.getState().loadOrders();
  useOrderStore.getState().loadStatistics();
}