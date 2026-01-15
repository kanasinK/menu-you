import {
  Order,
  Member,
  MasterData,
  ClaimOrder,
  ClaimOrderItem,
  OrderQuery,
  PaginatedResponse
} from '@/types';

// Import JSON data
import mastersData from '@/data/masters.json';
import membersData from '@/data/members.json';
import ordersData from '@/data/orders.json';
import claimsData from '@/data/claims.json';
import claimItemsData from '@/data/claim_items.json';

// Type definitions for raw JSON data
interface RawMasterItem {
  id: number;
  code: string;
  label?: string;
  name?: string;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  hex_code?: string;
  image_urls?: string[] | string;
}

interface RawMastersData {
  serviceTypes?: RawMasterItem[];
  themes?: RawMasterItem[];
  colors?: RawMasterItem[];
  products?: RawMasterItem[];
  sizes?: RawMasterItem[];
  orientations?: RawMasterItem[];
  pageOptions?: RawMasterItem[];
  imageOptions?: RawMasterItem[];
  brandOptions?: RawMasterItem[];
  materials?: RawMasterItem[];
  coatings?: RawMasterItem[];
  equipments?: RawMasterItem[];
  roles?: RawMasterItem[];
  status?: RawMasterItem[];
  paymentStatus?: RawMasterItem[];
  itemTypes?: RawMasterItem[];
  itemSizes?: RawMasterItem[];
  itemLayouts?: RawMasterItem[];
  itemTextures?: RawMasterItem[];
  itemSides?: RawMasterItem[];
  itemImages?: RawMasterItem[];
  itemDecorates?: RawMasterItem[];
  itemMaterials?: RawMasterItem[];
  itemToolTypes?: RawMasterItem[];
  productCategories?: RawMasterItem[];
  toolTypes?: RawMasterItem[];
}

const STORAGE_KEYS = {
  ORDERS: 'business_orders',
  MEMBERS: 'business_members',
  MASTERS: 'business_masters',
  CLAIMS: 'business_claims',
  CLAIM_ITEMS: 'business_claim_items',
};

// Utility functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Initialize data in localStorage if not exists
const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Initialize masters
  const existingMasters = localStorage.getItem(STORAGE_KEYS.MASTERS);
  if (!existingMasters) {
    saveToStorage(STORAGE_KEYS.MASTERS, mastersData);
  }

  // Initialize members
  const existingMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  if (!existingMembers) {
    saveToStorage(STORAGE_KEYS.MEMBERS, membersData);
  }

  // Initialize orders
  const existingOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!existingOrders) {
    saveToStorage(STORAGE_KEYS.ORDERS, ordersData);
  }

  // Initialize claims
  const existingClaims = localStorage.getItem(STORAGE_KEYS.CLAIMS);
  if (!existingClaims) {
    saveToStorage(STORAGE_KEYS.CLAIMS, claimsData);
  }

  // Initialize claim items
  const existingClaimItems = localStorage.getItem(STORAGE_KEYS.CLAIM_ITEMS);
  if (!existingClaimItems) {
    saveToStorage(STORAGE_KEYS.CLAIM_ITEMS, claimItemsData);
  }
};

// Initialize data on module load
initializeData();

// Master Data Repository
export const masterRepo = {
  getAll: (): MasterData => {
    const data = getFromStorage(STORAGE_KEYS.MASTERS, mastersData) as RawMastersData;

    // Convert JSON data to MasterData format
    const convertedData: MasterData = {
      serviceTypes: data.serviceTypes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      themes: data.themes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
        imageUrls: Array.isArray(item.image_urls) ? item.image_urls : undefined,
      })) || [],
      colors: data.colors?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
        hexCode: item.hex_code,
        imageUrls: Array.isArray(item.image_urls) ? item.image_urls : undefined,
      })) || [],
      products: data.products?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      sizes: data.sizes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      orientations: data.orientations?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      pageOptions: data.pageOptions?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      imageOptions: data.imageOptions?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      brandOptions: data.brandOptions?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      materials: data.materials?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      coatings: data.itemTextures?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      equipments: data.equipments?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      roles: data.roles?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      status: data.status?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      paymentStatus: data.paymentStatus?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.name || item.label || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemTypes: data.itemTypes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemSizes: data.itemSizes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemLayouts: data.itemLayouts?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemTextures: data.itemTextures?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemSides: data.itemSides?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemImages: data.itemImages?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemDecorates: data.itemDecorates?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemMaterials: data.itemMaterials?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      itemToolTypes: data.itemToolTypes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      productCategories: data.productCategories?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
      toolTypes: data.toolTypes?.map(item => ({
        id: item.id.toString(),
        code: item.code,
        name: item.label || item.name || '',
        isActive: item.is_active,
        createdAt: item.created_date,
        updatedAt: item.updated_date,
      })) || [],
    };

    return convertedData;
  },

  save: (masters: MasterData): void => {
    saveToStorage(STORAGE_KEYS.MASTERS, masters);
  },

  getOptionsForSelect: (type: keyof MasterData) => {
    const masters = masterRepo.getAll();
    return masters[type]
      .filter(item => item.isActive)
      .map(item => ({
        value: item.id,
        label: item.name,
        code: item.code,
      }));
  },

  getById: (type: keyof MasterData, id: string) => {
    const masters = masterRepo.getAll();
    return masters[type].find(item => item.id === id);
  },
};

// Member Repository
export const memberRepo = {
  getAll: (): Member[] => {
    return membersData.map(member => ({
      id: member.id,
      userName: member.user_name,
      nickname: member.nickname,
      email: member.email,
      roleCode: member.role_code,
      status: member.status,
      password: member.password ?? undefined,
      createdAt: member.created_date,
      updatedAt: member.updated_date,
    }));
  },

  getById: (id: string): Member | undefined => {
    const members = memberRepo.getAll();
    return members.find(member => member?.id?.toString() === id);
  },

  create: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Member => {
    const members = memberRepo.getAll();
    const maxId = members.reduce((max, m) => {
      const numId = m.id || 0;
      return numId > max ? numId : max;
    }, 0);

    const newMember: Member = {
      ...member,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMembers = [...members, newMember];
    saveToStorage(STORAGE_KEYS.MEMBERS, updatedMembers);
    return newMember;
  },

  update: (id: string, updates: Partial<Member>): Member | null => {
    const members = memberRepo.getAll();
    const memberIndex = members.findIndex(member => member?.id?.toString() === id);

    if (memberIndex === -1) return null;

    const updatedMember = {
      ...members[memberIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    members[memberIndex] = updatedMember;
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return updatedMember;
  },

  delete: (id: string): boolean => {
    const members = memberRepo.getAll();
    const filteredMembers = members.filter(member => member?.id?.toString() !== id);

    if (filteredMembers.length === members.length) return false;

    saveToStorage(STORAGE_KEYS.MEMBERS, filteredMembers);
    return true;
  },
};

// Order Repository
export const orderRepo = {
  getAll: (): Order[] => {
    const rawOrders = getFromStorage(STORAGE_KEYS.ORDERS, ordersData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawOrders.map((order: any) => ({
      id: order.id,
      code: order.code,
      fullName: order.fullName || order.full_name,
      statusCode: order.statusCode || order.status_code,
      serviceTypeCode: order.serviceTypeCode || order.service_type_code,
      shippingAddress: order.shippingAddress || order.shipping_address,
      shippingName: order.shippingName || order.shipping_name,
      coPartnerId: order.coPartnerId || order.co_partner_id,
      shopName: order.shopName || order.shop_name,
      email: order.email,
      tel: order.tel,
      facebook: order.facebook,
      line: order.line,
      designerOwnerId: order.designerOwnerId || order.designer_owner_id,
      moodTone: order.moodTone || order.mood_tone,
      colorCodes: order.moodTone || order.mood_tone, // Alias of moodTone
      themeCode: order.themeCode || order.theme_code,
      brief: order.brief,
      designInfoText: order.brief, // Alias of brief
      price: order.price,
      designerBudget: order.designerBudget || order.designer_budget,
      fileUrl: order.fileUrl || order.file_url,
      preProductionOwnerId: order.preProductionOwnerId || order.pre_production_owner_id,
      jobOwnerId: order.jobOwnerId || order.job_owner_id,
      discount: order.discount,
      paymentStatusCode: order.paymentStatusCode || order.payment_status_code,
      paid: order.paid,
      shipperOwnerId: order.shipperOwnerId || order.shipper_owner_id,
      shippingTel: order.shippingTel || order.shipping_tel,
      shippingPrice: order.shippingPrice || order.shipping_price,
      acceptDate: order.acceptDate || order.accept_date,
      createdAt: order.createdAt || order.created_date,
      updatedAt: order.updatedAt || order.updated_date,
      items: order.items || [],
    }));
  },

  getById: (id: string): Order | undefined => {
    const orders = orderRepo.getAll();
    return orders.find(order => order?.id?.toString() === id);
  },

  query: (params: OrderQuery): PaginatedResponse<Order> => {
    let orders = orderRepo.getAll();

    // Filter by search query
    if (params.q) {
      const q = params.q.toLowerCase();
      orders = orders.filter(order =>
        order?.code?.toLowerCase().includes(q) ||
        order.fullName.toLowerCase().includes(q) ||
        order?.shippingName?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (params.statusCode) {
      orders = orders.filter(order => order.statusCode === params.statusCode);
    }

    // Filter by payment status
    if (params.paymentStatusCode) {
      orders = orders.filter(order => order.paymentStatusCode === params.paymentStatusCode);
    }

    // Filter by service type
    if (params.serviceTypeCode) {
      orders = orders.filter(order => order.serviceTypeCode === params.serviceTypeCode);
    }

    // Sort orders
    if (params.sort) {
      const [field, direction] = params.sort.split(':');
      orders.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[field];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[field];

        if (direction === 'desc') {
          return (bValue ?? '') > (aValue ?? '') ? 1 : -1;
        }
        return (aValue ?? '') > (bValue ?? '') ? 1 : -1;
      });
    } else {
      // Default sort by created date desc
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const total = orders.length;
    const pages = Math.ceil(total / params.size);
    const start = (params.page - 1) * params.size;
    const paginatedOrders = orders.slice(start, start + params.size);

    return {
      data: paginatedOrders,
      pagination: {
        page: params.page,
        size: params.size,
        total,
        pages,
      },
    };
  },

  create: (order: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Order => {
    const orders = orderRepo.getAll();
    const newOrder: Order = {
      ...order,
      code: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedOrders = [...orders, newOrder];
    saveToStorage(STORAGE_KEYS.ORDERS, updatedOrders);
    return newOrder;
  },

  update: (id: string, updates: Partial<Order>): Order | null => {
    const orders = orderRepo.getAll();
    const orderIndex = orders.findIndex(order => order?.id?.toString() === id);

    if (orderIndex === -1) return null;

    const updatedOrder = {
      ...orders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    orders[orderIndex] = updatedOrder;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
    return updatedOrder;
  },

  delete: (id: string): boolean => {
    const orders = orderRepo.getAll();
    const filteredOrders = orders.filter(order => order?.id?.toString() !== id);

    if (filteredOrders.length === orders.length) return false;

    saveToStorage(STORAGE_KEYS.ORDERS, filteredOrders);
    return true;
  },

  getStatistics: () => {
    const orders = orderRepo.getAll();
    const masters = masterRepo.getAll();

    const stats = {
      total: orders.length,
      byStatus: {} as Record<string, number>,
      byPaymentStatus: {} as Record<string, number>,
      totalAmount: 0,
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };

    orders.forEach(order => {
      // Count by status
      const statusName = masters.status.find(s => s.id === order.statusCode)?.name || 'Unknown';
      stats.byStatus[statusName] = (stats.byStatus[statusName] || 0) + 1;

      // Count by payment status
      const paymentStatusName = masters.paymentStatus.find(s => s.id === order.paymentStatusCode)?.name || 'Unknown';
      stats.byPaymentStatus[paymentStatusName] = (stats.byPaymentStatus[paymentStatusName] || 0) + 1;

      // Sum total amount
      stats.totalAmount += order.price || 0;
    });

    return stats;
  },
};

// Claim Repository
export const claimRepo = {
  getAll: (): ClaimOrder[] => {
    const rawClaims = getFromStorage(STORAGE_KEYS.CLAIMS, claimsData);
    return rawClaims.map(claim => ({
      id: claim.id,
      orderId: claim.order_id,
      admin: claim.admin,
      designer: claim.designer,
      productionTeam: claim.production_team,
      shipper: claim.shipper,
      preProduction: claim.pre_production,
      createdAt: claim.created_date,
      updatedAt: claim.updated_date,
    }));
  },

  getById: (id: string): ClaimOrder | undefined => {
    const claims = claimRepo.getAll();
    return claims.find(claim => claim?.id?.toString() === id);
  },

  getByOrderId: (orderId: string): ClaimOrder[] => {
    const claims = claimRepo.getAll();
    return claims.filter(claim => claim.orderId.toString() === orderId);
  },

  create: (claim: Omit<ClaimOrder, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): ClaimOrder => {
    const claims = claimRepo.getAll();
    const newClaim: ClaimOrder = {
      ...claim,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedClaims = [...claims, newClaim];
    saveToStorage(STORAGE_KEYS.CLAIMS, updatedClaims);
    return newClaim;
  },

  update: (id: string, updates: Partial<ClaimOrder>): ClaimOrder | null => {
    const claims = claimRepo.getAll();
    const claimIndex = claims.findIndex(claim => claim?.id?.toString() === id);

    if (claimIndex === -1) return null;

    const updatedClaim = {
      ...claims[claimIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    claims[claimIndex] = updatedClaim;
    saveToStorage(STORAGE_KEYS.CLAIMS, claims);
    return updatedClaim;
  },
};

// Claim Item Repository
export const claimItemRepo = {
  getAll: (): ClaimOrderItem[] => {
    const rawItems = getFromStorage(STORAGE_KEYS.CLAIM_ITEMS, claimItemsData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawItems.map((item: any) => ({
      id: item.id,
      productionOwnerId: item.productionOwnerId || item.production_owner_id,
      itemTypeOther: item.itemTypeOther || item.item_type_other,
      itemTypeCode: item.itemTypeCode || item.item_type_code,
      sizeCode: item.sizeCode || item.size_code,
      sizeOther: item.sizeOther || item.size_other,
      layoutCode: item.layoutCode || item.layout_code,
      textureCode: item.textureCode || item.texture_code,
      sideCode: item.sideCode || item.side_code,
      imageCode: item.imageCode || item.image_code,
      imageOther: item.imageOther || item.image_other,
      decorateCode: item.decorateCode || item.decorate_code,
      materialCode: item.materialCode || item.material_code,
      materialOther: item.materialOther || item.material_other,
      toolTypeCode: item.toolTypeCode || item.tool_type_code,
      quantity: item.quantity,
      unitPrice: item.unitPrice || item.unit_price,
      linePrice: item.linePrice || item.line_price,
      itemPrice: item.itemPrice || item.item_price,
      designerPrice: item.designerPrice || item.designer_price,
      remarks: item.remarks,
      createdAt: item.createdAt || item.created_date,
      updatedAt: item.updatedAt || item.updated_date,
    }));
  },

  // getByClaimId: (claimId: string): ClaimOrderItem[] => {
  //   const claimItems = claimItemRepo.getAll();
  //   return claimItems.filter(item => item.claimId === claimId);
  // },

  // create: (claimItem: Omit<ClaimOrderItem, 'id' | 'createdAt' | 'updatedAt'>): ClaimOrderItem => {
  //   const claimItems = claimItemRepo.getAll();
  //   const newClaimItem: ClaimOrderItem = {
  //     ...claimItem,
  //     id: Date.now().toString(),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };

  //   const updatedClaimItems = [...claimItems, newClaimItem];
  //   saveToStorage(STORAGE_KEYS.CLAIM_ITEMS, updatedClaimItems);
  //   return newClaimItem;
  // },

  update: (id: string, updates: Partial<ClaimOrderItem>): ClaimOrderItem | null => {
    const claimItems = claimItemRepo.getAll();
    const itemIndex = claimItems.findIndex(item => item?.id?.toString() === id);

    if (itemIndex === -1) return null;

    const updatedItem = {
      ...claimItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    claimItems[itemIndex] = updatedItem;
    saveToStorage(STORAGE_KEYS.CLAIM_ITEMS, claimItems);
    return updatedItem;
  },
};