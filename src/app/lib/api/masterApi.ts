import { getSupabase } from '../supabase'
import { MasterData, MasterItem } from '@/types'
import { toCamelCaseObject } from '@/utils/caseConverter'

// Master data API service สำหรับดึงข้อมูลจาก Supabase/Database
export class MasterApiService {
  // helper: แปลง row ให้เป็น MasterItem ที่สอดคล้องกับ type
  private static normalizeRow = (row: Record<string, unknown>): MasterItem => {
    const c = toCamelCaseObject(row || {}) as Record<string, unknown>
    const createdAt = c.createdAt || c.createdDate || c.created_at || c.created_date || ''
    const updatedAt = c.updatedAt || c.updatedDate || c.updated_at || c.updated_date || ''

    return {
      id: String(c.id ?? ''),
      code: String(c.code ?? ''),
      name: String(c.name ?? c.label ?? c.code ?? ''),
      isActive: Boolean(
        c.isActive !== undefined ? c.isActive : c.is_active !== undefined ? c.is_active : true,
      ),
      createdAt: String(createdAt),
      updatedAt: String(updatedAt),
      ...c,
    }
  }

  // helper: ดึงตารางจาก Supabase แบบปลอดภัยและ normalize
  private static async fetchTable(tableName: string): Promise<MasterItem[]> {
    const client = getSupabase()
    if (!client) throw new Error('Supabase is not configured')

    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (error) throw error
    return (data || []).map(MasterApiService.normalizeRow)
  }
  // ดึงข้อมูล master ทั้งหมดจาก Supabase
  static async getAllMasters(): Promise<MasterData> {
    // หากยังไม่ได้ตั้งค่า Supabase ให้โยน error เพื่อให้ store fallback ไป localStorage
    if (!getSupabase()) throw new Error('Supabase not configured')

    const tasks = {
      serviceTypes: () => this.getServiceTypes(),
      themes: () => this.getThemes(),
      colors: () => this.getColors(),
      products: () => this.getProducts(),
      orientations: () => this.getOrientations(),
      pageOptions: () => this.getPageOptions(),
      imageOptions: () => this.getImageOptions(),
      brandOptions: () => this.getBrandOptions(),
      materials: () => this.getMaterials(),
      coatings: () => this.getCoatings(),
      equipments: () => this.getEquipments(),
      roles: () => this.getRoles(),
      status: () => this.getStatus(),
      paymentStatus: () => this.getPaymentStatus(),
      itemTypes: () => this.getItemTypes(),
      itemSizes: () => this.getItemSizes(),
      itemLayouts: () => this.getItemLayouts(),
      itemTextures: () => this.getItemTextures(),
      itemSides: () => this.getItemSides(),
      itemImages: () => this.getItemImages(),
      itemDecorates: () => this.getItemDecorates(),
      itemMaterials: () => this.getItemMaterials(),
      itemToolTypes: () => this.getItemToolTypes(),
      productCategories: () => this.getProductCategories(),
      toolTypes: () => this.getToolTypes(),
    } as const

    const entries = Object.entries(tasks)
    const settled = await Promise.allSettled(entries.map(([, fn]) => fn()))

    const result: Record<string, MasterItem[]> = {}
    settled.forEach((res, idx) => {
      const key = entries[idx][0]
      if (res.status === 'fulfilled') result[key] = res.value
      else result[key] = []
    })

    return result as unknown as MasterData
  }

  // ดึงข้อมูล service types จาก Supabase
  static async getServiceTypes(): Promise<MasterItem[]> {
    return this.fetchTable('service_types')
  }

  // ดึงข้อมูล themes
  static async getThemes(): Promise<MasterItem[]> {
    return this.fetchTable('themes')
  }

  // ดึงข้อมูล colors
  static async getColors(): Promise<MasterItem[]> {
    return this.fetchTable('colors')
  }

  // ดึงข้อมูล products
  static async getProducts(): Promise<MasterItem[]> {
    return this.fetchTable('products')
  }

  // ดึงข้อมูล sizes
  static async getSizes(): Promise<MasterItem[]> {
    return this.fetchTable('item_sizes')
  }

  // ดึงข้อมูล orientations
  static async getOrientations(): Promise<MasterItem[]> {
    return this.fetchTable('orientations')
  }

  // ดึงข้อมูล page options
  static async getPageOptions(): Promise<MasterItem[]> {
    return this.fetchTable('page_options')
  }

  // ดึงข้อมูล image options
  static async getImageOptions(): Promise<MasterItem[]> {
    return this.fetchTable('image_options')
  }

  // ดึงข้อมูล brand options
  static async getBrandOptions(): Promise<MasterItem[]> {
    return this.fetchTable('brand_options')
  }

  // ดึงข้อมูล materials
  static async getMaterials(): Promise<MasterItem[]> {
    return this.fetchTable('item_materials')
  }

  // ดึงข้อมูล coatings
  static async getCoatings(): Promise<MasterItem[]> {
    return this.fetchTable('coatings')
  }

  // ดึงข้อมูล equipments
  static async getEquipments(): Promise<MasterItem[]> {
    return this.fetchTable('equipments')
  }

  // ดึงข้อมูล roles
  static async getRoles(): Promise<MasterItem[]> {
    return this.fetchTable('roles')
  }

  // ดึงข้อมูล status
  static async getStatus(): Promise<MasterItem[]> {
    return this.fetchTable('status')
  }

  // ดึงข้อมูล payment status
  static async getPaymentStatus(): Promise<MasterItem[]> {
    return this.fetchTable('payment_status')
  }

  // ดึงข้อมูล item types
  static async getItemTypes(): Promise<MasterItem[]> {
    return this.fetchTable('item_types')
  }

  // ดึงข้อมูล item sizes
  static async getItemSizes(): Promise<MasterItem[]> {
    return this.fetchTable('item_sizes')
  }

  // ดึงข้อมูล item layouts
  static async getItemLayouts(): Promise<MasterItem[]> {
    return this.fetchTable('item_layouts')
  }

  // ดึงข้อมูล item textures
  static async getItemTextures(): Promise<MasterItem[]> {
    return this.fetchTable('item_textures')
  }

  // ดึงข้อมูล item sides
  static async getItemSides(): Promise<MasterItem[]> {
    return this.fetchTable('item_sides')
  }

  // ดึงข้อมูล item images
  static async getItemImages(): Promise<MasterItem[]> {
    return this.fetchTable('item_images')
  }

  // ดึงข้อมูล item decorates
  static async getItemDecorates(): Promise<MasterItem[]> {
    return this.fetchTable('item_decorates')
  }

  // ดึงข้อมูล item materials
  static async getItemMaterials(): Promise<MasterItem[]> {
    return this.fetchTable('item_materials')
  }

  // ดึงข้อมูล item tool types
  static async getItemToolTypes(): Promise<MasterItem[]> {
    return this.fetchTable('item_tool_types')
  }

  // ดึงข้อมูล product categories
  static async getProductCategories(): Promise<MasterItem[]> {
    return this.fetchTable('product_categories')
  }

  // ดึงข้อมูล tool types (ใช้ table เดียวกับ item_tool_types)
  static async getToolTypes(): Promise<MasterItem[]> {
    return this.fetchTable('item_tool_types')
  }

  // ดึงข้อมูล master ตาม type
  static async getMasterByType(type: keyof MasterData): Promise<MasterItem[]> {
    if (type === 'status') return this.getStatus()
    if (type === 'paymentStatus') return this.getPaymentStatus()

    const tableMap: Record<string, string> = {
      serviceTypes: 'service_types',
      themes: 'themes',
      colors: 'colors',
      products: 'products',
      sizes: 'sizes',
      orientations: 'orientations',
      pageOptions: 'page_options',
      imageOptions: 'image_options',
      brandOptions: 'brand_options',
      coatings: 'coatings',
      equipments: 'equipments',
      roles: 'roles',
      itemTypes: 'item_types',
      itemSizes: 'item_sizes',
      itemLayouts: 'item_layouts',
      itemTextures: 'item_textures',
      itemSides: 'item_sides',
      itemImages: 'item_images',
      itemDecorates: 'item_decorates',
      itemMaterials: 'item_materials',
      itemToolTypes: 'item_tool_types',
      productCategories: 'product_categories',
      toolTypes: 'item_tool_types',
    }

    const tableName = tableMap[type as string]
    if (!tableName) {
      throw new Error(`Unknown master type: ${String(type)}`)
    }

    return this.fetchTable(tableName)
  }

  // อัปเดตข้อมูล master
  static async updateMaster(
    type: keyof MasterData,
    id: string,
    updates: Partial<MasterItem>
  ): Promise<MasterItem | null> {
    const tableMap: Record<string, string> = {
      serviceTypes: 'service_types',
      themes: 'themes',
      colors: 'colors',
      products: 'products',
      sizes: 'sizes',
      orientations: 'orientations',
      pageOptions: 'page_options',
      imageOptions: 'image_options',
      brandOptions: 'brand_options',
      materials: 'materials',
      coatings: 'coatings',
      equipments: 'equipments',
      roles: 'roles'
    };

    const tableName = tableMap[type];
    if (!tableName) {
      throw new Error(`Unknown master type: ${type}`);
    }

    const client = getSupabase()
    if (!client) throw new Error('Supabase is not configured')

    const { data, error } = await client
      .from(tableName)
      .update({
        ...updates,
        updated_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // สร้างข้อมูล master ใหม่
  static async createMaster(
    type: keyof MasterData,
    masterData: Omit<MasterItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MasterItem> {
    const tableMap: Record<string, string> = {
      serviceTypes: 'service_types',
      themes: 'themes',
      colors: 'colors',
      products: 'products',
      sizes: 'sizes',
      orientations: 'orientations',
      pageOptions: 'page_options',
      imageOptions: 'image_options',
      brandOptions: 'brand_options',
      materials: 'materials',
      coatings: 'coatings',
      equipments: 'equipments',
      roles: 'roles'
    };

    const tableName = tableMap[type];
    if (!tableName) {
      throw new Error(`Unknown master type: ${type}`);
    }

    const client = getSupabase()
    if (!client) throw new Error('Supabase is not configured')

    const { data, error } = await client
      .from(tableName)
      .insert({
        ...masterData,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
