import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabase } from '@/lib/supabase'

const orderItemSchema = z.object({
  productCode: z.string().nullable().optional(),
  productOther: z.string().nullable().optional(),
  sizeCode: z.string().nullable().optional(),
  sizeWidth: z.number().nullable().optional(),
  sizeHeight: z.number().nullable().optional(),
  orientationCode: z.string().nullable().optional(),
  coatingCode: z.string().nullable().optional(),
  pageOptionCode: z.string().nullable().optional(),
  imageOptionCode: z.string().nullable().optional(),
  brandOptionCode: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
})

const requestSchema = z
  .object({
    fullName: z.string().min(1),
    shopName: z.string().min(1),
    tel: z.string().regex(/^0\d{8,9}$/),
    email: z.string().email().optional().nullable(),
    facebook: z.string().optional().nullable(),
    line: z.string().optional().nullable(),
    serviceTypeCode: z.enum(['DESIGN_ONLY', 'PRODUCTION_ONLY', 'DESIGN_AND_PRODUCTION']),
    shippingName: z.string().optional().nullable(),
    shippingTel: z.string().optional().nullable(),
    shippingAddress: z.string().optional().nullable(),
    themeCode: z.string().optional().nullable(),
    colorCodes: z.array(z.string()).optional().nullable(),
    designInfoText: z.string().optional().nullable(),
    items: z.array(orderItemSchema).optional().nullable(),
  })
  .refine((d) => !!(d.facebook || d.line), { message: 'facebook or line is required', path: ['facebook'] })
  .refine((d) => {
    if (d.serviceTypeCode === 'PRODUCTION_ONLY' || d.serviceTypeCode === 'DESIGN_AND_PRODUCTION') {
      return !!(d.shippingName && d.shippingTel && d.shippingAddress)
    }
    return true
  }, { message: 'shipping info required for delivery', path: ['shippingName'] })
  .refine((d) => {
    if (d.serviceTypeCode === 'DESIGN_ONLY' || d.serviceTypeCode === 'DESIGN_AND_PRODUCTION') {
      return !!d.themeCode
    }
    return true
  }, { message: 'theme required for design', path: ['themeCode'] })
  .refine((d) => {
    if (d.serviceTypeCode === 'DESIGN_ONLY' || d.serviceTypeCode === 'DESIGN_AND_PRODUCTION') {
      const len = d.colorCodes?.length || 0
      return len >= 1 && len <= 3
    }
    return true
  }, { message: 'colorCodes must be 1-3 for design', path: ['colorCodes'] })
  .superRefine((d, ctx) => {
    const isDesign = d.serviceTypeCode === 'DESIGN_ONLY' || d.serviceTypeCode === 'DESIGN_AND_PRODUCTION'
    if (!isDesign) return

    const items = d.items || []
    if (!items.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'at least one design item is required', path: ['items'] })
      return
    }

    items.forEach((it, idx) => {
      const requireField = (value: unknown, fieldPath: (string | number)[], msg: string) => {
        const isEmpty = value === undefined || value === null || `${value}`.trim() === ''
        if (isEmpty) ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ['items', idx, ...fieldPath] })
      }

      requireField(it.productCode, ['productCode'], 'productCode is required')
      if (it.productCode === 'OTHER') requireField(it.productOther, ['productOther'], 'productOther is required when productCode=OTHER')

      requireField(it.sizeCode, ['sizeCode'], 'sizeCode is required')
      if (it.sizeCode === 'CUSTOM') {
        requireField(it.sizeWidth, ['sizeWidth'], 'sizeWidth is required when sizeCode=CUSTOM')
        requireField(it.sizeHeight, ['sizeHeight'], 'sizeHeight is required when sizeCode=CUSTOM')
      }

      requireField(it.orientationCode, ['orientationCode'], 'orientationCode is required')
      requireField(it.coatingCode, ['coatingCode'], 'coatingCode is required')
      requireField(it.pageOptionCode, ['pageOptionCode'], 'pageOptionCode is required')
      requireField(it.imageOptionCode, ['imageOptionCode'], 'imageOptionCode is required')
      requireField(it.brandOptionCode, ['brandOptionCode'], 'brandOptionCode is required')
      requireField(it.quantity, ['quantity'], 'quantity is required')

      if (it.quantity != null) {
        const q = Number(it.quantity)
        if (!Number.isFinite(q) || q <= 0 || !Number.isInteger(q)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'quantity must be a positive integer', path: ['items', idx, 'quantity'] })
        }
      }
    })
  })

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

    const body = await req.json()
    console.log('🔵 API received body:', body)
    console.log('🔵 Items received:', body.items)
    
    const parsed = requestSchema.parse(body)

    const statusCode = 'PENDING'
    const paymentStatusCode = 'PENDING'

    // mood_tone เก็บ array ของ colors เป็น JSON
    const moodTone = Array.isArray(parsed.colorCodes) && parsed.colorCodes.length
      ? JSON.stringify(parsed.colorCodes)
      : null

    // brief เก็บเฉพาะข้อมูลเพิ่มเติมการออกแบบ
    const brief = parsed.designInfoText?.trim() || null

    const insertPayload = {
      full_name: parsed.fullName,
      status_code: statusCode,
      service_type_code: parsed.serviceTypeCode,
      shipping_address: parsed.shippingAddress || null,
      shipping_name: parsed.shippingName || null,
      co_partner_id: null,
      shop_name: parsed.shopName,
      email: parsed.email || null,
      tel: parsed.tel,
      facebook: parsed.facebook || null,
      line: parsed.line || null,
      designer_owner_id: null,
      mood_tone: moodTone,
      theme_code: parsed.themeCode || null,
      brief,
      price: null,
      designer_budget: null,
      file_url: null,
      pre_production_owner_id: null,
      job_owner_id: null,
      discount: null,
      payment_status_code: paymentStatusCode,
      paid: null,
      shipper_owner_id: null,
      shipping_tel: parsed.shippingTel || null,
      shipping_price: null,
      accept_date: null,
    }

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select('id')
      .single()

    if (orderErr || !orderRow) {
      return NextResponse.json({ error: orderErr?.message || 'Failed to create order' }, { status: 400 })
    }

    const orderId = orderRow.id as number

    const rawItems = parsed.items || []
    const mappedItems = rawItems.map((item) => ({
      order_id: orderId,
      item_type_code: item.productCode || null,
      item_type_other: item.productOther || null,
      size_code: item.sizeCode || null,
      width: item.sizeWidth ?? null,
      height: item.sizeHeight ?? null,
      layout_code: item.orientationCode || null,
      texture_code: item.coatingCode || null,
      side_code: item.pageOptionCode || null,
      image_code: item.imageOptionCode || null,
      decorate_code: item.brandOptionCode || null,
      quantity: item.quantity ?? null,
      production_owner_id: null,
      material_code: null,
      material_other: null,
      item_price: null,
      designer_price: null,
      tool_type_code: null,
    }))

    // กรองรายการที่ว่างเปล่า (ไม่มีข้อมูลใดๆ เลย) ไม่ให้ถูก insert
    const hasMeaningfulValue = (val: unknown) => val !== null && val !== undefined && val !== ''
    const items = mappedItems.filter((it) =>
      [
        it.item_type_code,
        it.item_type_other,
        it.size_code,
        it.width,
        it.height,
        it.layout_code,
        it.texture_code,
        it.side_code,
        it.image_code,
        it.decorate_code,
        it.quantity,
      ].some(hasMeaningfulValue)
    )

    console.log('🟢 Mapped items for DB:', items)
    console.log('🟢 Items count:', items.length)

    if (items.length) {
      console.log('🟢 Inserting items into order_item table...')
      const { error: itemErr } = await supabase.from('order_item').insert(items)
      if (itemErr) {
        console.error('🔴 Items insert error:', itemErr)
        return NextResponse.json({ error: `Order created but items failed: ${itemErr.message}`, id: orderId }, { status: 207 })
      }
      console.log('✅ Items inserted successfully')
    } else {
      console.log('⚠️ No items to insert')
    }

    return NextResponse.json({ id: orderId })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
