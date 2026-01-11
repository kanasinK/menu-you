import { http } from './http'
import { getSupabase } from '../supabase'
import { Order, PaginatedResponse, OrderQuery } from '@/types'
import { toCamelCaseObject } from '@/utils/caseConverter'

export interface CreateOrderRequest {
  fullName: string
  shopName: string
  tel: string
  email?: string | null
  facebook?: string | null
  line?: string | null
  serviceTypeCode: 'DESIGN_ONLY' | 'PRODUCTION_ONLY' | 'DESIGN_AND_PRODUCTION'
  shippingName?: string | null
  shippingTel?: string | null
  shippingAddress?: string | null
  themeCode?: string | null
  colorCodes?: string[]
  designInfoText?: string | null
  items?: Array<{
    productCode?: string | null
    productOther?: string | null
    sizeCode?: string | null
    sizeWidth?: number | null
    sizeHeight?: number | null
    orientationCode?: string | null
    coatingCode?: string | null
    pageOptionCode?: string | null
    imageOptionCode?: string | null
    brandOptionCode?: string | null
    quantity?: number | null
  }>
}

export interface CreateOrderResponse {
  id: number
}

export interface ApiError {
  error: string
  id?: number
}

export class OrderApiService {
  static async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    console.log('🚀 Calling API /api/orders with data:', data)
    const resp = await http.post<CreateOrderResponse>('/api/orders', data)
    console.log('✅ API Response:', resp)
    console.log('📬 Response data:', resp.data)
    return resp.data
  }

  // แปลงแถวจาก DB (snake_case) เป็น Order (camelCase) แบบให้ใช้งานได้ในตาราง
  private static normalizeOrderRow = (row: unknown): Order => {
    const c = toCamelCaseObject(row || {}) as Record<string, unknown>
    // สำคัญ: ฟิลด์ที่หน้า UI ใช้
    return {
      id: (c.id as number | undefined),
      code: (c.code as string | undefined) || `ORD-${(c.id as number | string | undefined) ?? ''}`,
      fullName: (c.fullName as string | undefined) || (c.full_name as string | undefined) || '',
      statusCode: (c.statusCode as string | null | undefined) ?? (c.status_code as string | null | undefined) ?? null,
      serviceTypeCode: (c.serviceTypeCode as string | null | undefined) ?? (c.service_type_code as string | null | undefined) ?? null,
      shippingAddress: (c.shippingAddress as string | null | undefined) ?? (c.shipping_address as string | null | undefined) ?? null,
      shippingName: (c.shippingName as string | null | undefined) ?? (c.shipping_name as string | null | undefined) ?? null,
      coPartnerId: (c.coPartnerId as number | null | undefined) ?? (c.co_partner_id as number | null | undefined) ?? null,
      shopName: (c.shopName as string | null | undefined) ?? (c.shop_name as string | null | undefined) ?? null,
      email: (c.email as string | null | undefined) ?? null,
      tel: (c.tel as string | null | undefined) ?? null,
      facebook: (c.facebook as string | null | undefined) ?? null,
      line: (c.line as string | null | undefined) ?? null,
      designerOwnerId: (c.designerOwnerId as number | null | undefined) ?? (c.designer_owner_id as number | null | undefined) ?? null,
      moodTone: Array.isArray(c.moodTone)
        ? (c.moodTone as string[])
        : typeof c.moodTone === 'string'
          ? (() => { try { return JSON.parse(c.moodTone as string) as string[] } catch { return null } })()
          : ((c.moodTone as string[] | null | undefined) ?? null),
      themeCode: (c.themeCode as string | null | undefined) ?? (c.theme_code as string | null | undefined) ?? null,
      brief: (c.brief as string | null | undefined) ?? null,
      price: (c.price as number | null | undefined) ?? null,
      designerBudget: (c.designerBudget as number | null | undefined) ?? (c.designer_budget as number | null | undefined) ?? null,
      fileUrl: (c.fileUrl as string | null | undefined) ?? (c.file_url as string | null | undefined) ?? null,
      preProductionOwnerId: (c.preProductionOwnerId as number | null | undefined) ?? (c.pre_production_owner_id as number | null | undefined) ?? null,
      jobOwnerId: (c.jobOwnerId as number | null | undefined) ?? (c.job_owner_id as number | null | undefined) ?? null,
      discount: (c.discount as number | null | undefined) ?? null,
      paymentStatusCode: (c.paymentStatusCode as string | null | undefined) ?? (c.payment_status_code as string | null | undefined) ?? null,
      paid: (c.paid as number | null | undefined) ?? null,
      shipperOwnerId: (c.shipperOwnerId as number | null | undefined) ?? (c.shipper_owner_id as number | null | undefined) ?? null,
      shippingTel: (c.shippingTel as string | null | undefined) ?? (c.shipping_tel as string | null | undefined) ?? null,
      shippingPrice: (c.shippingPrice as number | null | undefined) ?? (c.shipping_price as number | null | undefined) ?? null,
      acceptDate: (c.acceptDate as string | null | undefined) ?? (c.accept_date as string | null | undefined) ?? null,
      createdAt: (c.createdAt as string | undefined) || (c.created_date as string | undefined) || new Date().toISOString(),
      updatedAt: (c.updatedAt as string | undefined) || (c.updated_date as string | undefined) || new Date().toISOString(),
    }
  }

  static async queryOrders(params: OrderQuery): Promise<PaginatedResponse<Order>> {
    const client = getSupabase()
    if (!client) throw new Error('Supabase not configured')

    const page = params.page || 1
    const size = params.size || 10
    const from = (page - 1) * size
    const to = from + size - 1

    let q = client
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_date', { ascending: false })

    if (params.q) {
      const keyword = params.q.trim()
      if (keyword) {
        q = q.or(
          `code.ilike.%${keyword}%,full_name.ilike.%${keyword}%,shipping_name.ilike.%${keyword}%`
        )
      }
    }

    if (params.statusCode) q = q.eq('status_code', params.statusCode)
    if (params.paymentStatusCode) q = q.eq('payment_status_code', params.paymentStatusCode)
    if (params.serviceTypeCode) q = q.eq('service_type_code', params.serviceTypeCode)

    const { data, error, count } = await q.range(from, to)
    if (error) throw error

    const list = (data || []).map(this.normalizeOrderRow)
    const total = count || 0
    const pages = Math.max(1, Math.ceil(total / size))

    return {
      data: list,
      pagination: { page, size, total, pages },
    }
  }

  static async getOrderById(id: string | number): Promise<Order | undefined> {
    const client = getSupabase()
    if (!client) throw new Error('Supabase not configured')

    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return undefined
    return this.normalizeOrderRow(data)
  }
}
