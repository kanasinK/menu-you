import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer } from '@/lib/supabase'

// Helper function สำหรับคำนวณราคา
function calculateItemPrices(item: { quantity?: number | null; itemPrice?: number | null; designerPrice?: number | null }) {
    const quantity = item.quantity ?? 0
    const itemPrice = item.itemPrice ?? 0
    const designerPrice = item.designerPrice ?? 0
    const sumItemPrice = quantity * itemPrice
    const totalPrice = sumItemPrice + designerPrice
    return { sumItemPrice, totalPrice }
}

function calculateMaterialPrice(mat: { quantity?: number | null; price?: number | null }) {
    const quantity = mat.quantity ?? 0
    const price = mat.price ?? 0
    return quantity * price
}

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
    itemPrice: z.number().nullable().optional(),      // ราคาผลิตต่อชิ้น
    designerPrice: z.number().nullable().optional(),  // ค่าออกแบบ
})

const orderMaterialSchema = z.object({
    materialCode: z.string().nullable().optional(),
    materialOther: z.string().nullable().optional(),
    quantity: z.number().nullable().optional(),
    price: z.number().nullable().optional(),
    note: z.string().nullable().optional(),
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
    // ฟิลด์ราคา
    discount: z.number().optional().nullable(),
    shippingPrice: z.number().optional().nullable(),
    paid: z.number().optional().nullable(),
    price: z.number().optional().nullable(),
    items: z.array(orderItemSchema).optional().nullable(),
    materials: z.array(orderMaterialSchema).optional().nullable(),
})

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const supabase = getSupabaseServer()
        if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

        // ดึง order
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

        // ดึง order materials
        const { data: materials, error: materialsError } = await supabase
            .from('order_materials')
            .select('*')
            .eq('order_id', id)

        if (materialsError) {
            console.error('Error fetching order materials:', materialsError)
        }

        return NextResponse.json({ ...order, items: items || [], materials: materials || [] })
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
        // ฟิลด์ราคา
        if (parsed.discount !== undefined) updatePayload.discount = parsed.discount
        if (parsed.shippingPrice !== undefined) updatePayload.shipping_price = parsed.shippingPrice
        if (parsed.paid !== undefined) updatePayload.paid = parsed.paid
        if (parsed.price !== undefined) updatePayload.price = parsed.price

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
        let itemsTotal = 0
        if (parsed.items !== undefined) {
            const orderId = Number(id)

            // ลบ items เดิมก่อน
            await supabase.from('order_item').delete().eq('order_id', orderId)

            // Insert items ใหม่
            if (parsed.items && parsed.items.length > 0) {
                const mappedItems = parsed.items.map((item) => {
                    const { sumItemPrice, totalPrice } = calculateItemPrices(item)
                    itemsTotal += totalPrice
                    return {
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
                        item_price: item.itemPrice ?? null,
                        designer_price: item.designerPrice ?? null,
                        sum_item_price: sumItemPrice,
                        total_price: totalPrice,
                    }
                })

                const { error: itemErr } = await supabase.from('order_item').insert(mappedItems)
                if (itemErr) {
                    console.error('Items update error:', itemErr)
                }
            }
        }

        // Update materials if provided
        let materialsTotal = 0
        if (parsed.materials !== undefined) {
            const orderId = Number(id)

            // ลบ materials เดิมก่อน
            const { error: delErr } = await supabase.from('order_materials').delete().eq('order_id', orderId)
            if (delErr) {
                console.error('Materials delete error:', delErr)
            }

            // Insert materials ใหม่
            if (parsed.materials && parsed.materials.length > 0) {
                const mappedMaterials = parsed.materials.map((mat) => {
                    const totalPrice = calculateMaterialPrice(mat)
                    materialsTotal += totalPrice
                    return {
                        order_id: orderId,
                        material_code: mat.materialCode || null,
                        material_other: mat.materialOther || null,
                        quantity: mat.quantity ?? 0,
                        price: mat.price ?? 0,
                        total_price: totalPrice,
                        note: mat.note || null,
                    }
                })

                const { error: matErr } = await supabase.from('order_materials').insert(mappedMaterials)
                if (matErr) {
                    console.error('Materials insert error:', matErr)
                }
            }
        }

        // อัปเดตราคารวมใน orders
        const discount = parsed.discount ?? 0
        const shippingPrice = parsed.shippingPrice ?? 0
        const subtotal = itemsTotal + materialsTotal
        const grandTotal = subtotal - discount + shippingPrice

        const { error: updatePriceErr } = await supabase
            .from('orders')
            .update({
                items_total: itemsTotal,
                materials_total: materialsTotal,
                subtotal: subtotal,
                grand_total: grandTotal,
            })
            .eq('id', id)

        if (updatePriceErr) {
            console.error('Update price totals error:', updatePriceErr)
        }

        return NextResponse.json(data[0])
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal Server Error'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
