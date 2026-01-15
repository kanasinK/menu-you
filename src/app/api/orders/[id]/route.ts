import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer } from '@/lib/supabase'

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

const updateSchema = z.object({
    fullName: z.string().optional(),
    shopName: z.string().optional(),
    tel: z.string().optional(),
    email: z.string().email().optional().nullable(),
    facebook: z.string().optional().nullable(),
    line: z.string().optional().nullable(),
    serviceTypeCode: z.enum(['DESIGN_ONLY', 'PRODUCTION_ONLY', 'DESIGN_AND_PRODUCTION']).optional(),
    statusCode: z.string().optional(),
    paymentStatusCode: z.string().optional(),
    shippingName: z.string().optional().nullable(),
    shippingTel: z.string().optional().nullable(),
    shippingAddress: z.string().optional().nullable(),
    themeCode: z.string().optional().nullable(),
    colorCodes: z.array(z.string()).optional().nullable(),
    designInfoText: z.string().optional().nullable(),
    designerOwnerId: z.number().optional().nullable(),
    items: z.array(orderItemSchema).optional().nullable(),
})

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = getSupabaseServer()
        if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

        // ดึง order พร้อม items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single()

        if (orderError) return NextResponse.json({ error: orderError.message }, { status: 404 })

        // ดึง order items
        const { data: items, error: itemsError } = await supabase
            .from('order_item')
            .select('*')
            .eq('order_id', id)

        if (itemsError) {
            console.error('Error fetching order items:', itemsError)
        }

        return NextResponse.json({ ...order, items: items || [] })
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = getSupabaseServer()
        if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

        const body = await req.json()
        const parsed = updateSchema.parse(body)

        // Map form fields to DB fields
        const updatePayload: Record<string, unknown> = {
            updated_date: new Date().toISOString(),
        }

        if (parsed.fullName !== undefined) updatePayload.full_name = parsed.fullName
        if (parsed.shopName !== undefined) updatePayload.shop_name = parsed.shopName
        if (parsed.tel !== undefined) updatePayload.tel = parsed.tel
        if (parsed.email !== undefined) updatePayload.email = parsed.email
        if (parsed.facebook !== undefined) updatePayload.facebook = parsed.facebook
        if (parsed.line !== undefined) updatePayload.line = parsed.line
        if (parsed.serviceTypeCode !== undefined) updatePayload.service_type_code = parsed.serviceTypeCode
        if (parsed.statusCode !== undefined) updatePayload.status_code = parsed.statusCode
        if (parsed.paymentStatusCode !== undefined) updatePayload.payment_status_code = parsed.paymentStatusCode
        if (parsed.shippingName !== undefined) updatePayload.shipping_name = parsed.shippingName
        if (parsed.shippingTel !== undefined) updatePayload.shipping_tel = parsed.shippingTel
        if (parsed.shippingAddress !== undefined) updatePayload.shipping_address = parsed.shippingAddress
        if (parsed.themeCode !== undefined) updatePayload.theme_code = parsed.themeCode
        if (parsed.colorCodes !== undefined) {
            updatePayload.mood_tone = parsed.colorCodes?.length ? JSON.stringify(parsed.colorCodes) : null
        }
        if (parsed.designInfoText !== undefined) updatePayload.brief = parsed.designInfoText
        if (parsed.designerOwnerId !== undefined) updatePayload.designer_owner_id = parsed.designerOwnerId

        const { data, error } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', id)
            .select()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Update items if provided
        if (parsed.items !== undefined) {
            const orderId = Number(id)

            // ลบ items เดิมก่อน
            await supabase.from('order_item').delete().eq('order_id', orderId)

            // Insert items ใหม่
            if (parsed.items && parsed.items.length > 0) {
                const mappedItems = parsed.items.map((item) => ({
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
                }))

                const { error: itemErr } = await supabase.from('order_item').insert(mappedItems)
                if (itemErr) {
                    console.error('Items update error:', itemErr)
                }
            }
        }

        return NextResponse.json(data[0])
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal Server Error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
