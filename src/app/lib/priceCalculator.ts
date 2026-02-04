/**
 * Price Calculator Utilities
 * คำนวณราคาสำหรับ Order และ Order Items
 */

// ==================== Types ====================

export interface OrderItemPrice {
    quantity: number
    itemPrice: number      // ราคาผลิตต่อชิ้น
    designerPrice: number  // ค่าออกแบบ
}

export interface OrderItemPriceResult {
    sumItemPrice: number   // ค่าผลิตรวม (quantity × itemPrice)
    totalPrice: number     // ราคารวมต่อชิ้นงาน (sumItemPrice + designerPrice)
}

export interface MaterialPrice {
    quantity: number
    price: number
}

export interface MaterialPriceResult {
    totalPrice: number     // ราคาอุปกรณ์รวม (quantity × price)
}

export interface OrderPriceInput {
    items: OrderItemPrice[]
    materials?: MaterialPrice[]
    discount?: number
    shippingPrice?: number
    paid?: number
}

export interface OrderPriceResult {
    itemsTotal: number           // รวมราคาชิ้นงานทั้งหมด
    materialsTotal: number       // รวมราคาอุปกรณ์ทั้งหมด
    subtotal: number             // รวมก่อนหักส่วนลด (items + materials)
    discount: number             // ส่วนลด
    afterDiscount: number        // ราคาหลังหักส่วนลด
    shippingPrice: number        // ค่าขนส่ง
    grandTotal: number           // ราคารวมสุทธิ
    paid: number                 // ชำระแล้ว
    remaining: number            // คงเหลือ
}

// ==================== Calculation Functions ====================

/**
 * คำนวณราคาต่อชิ้นงาน (Order Item)
 * - ค่าผลิต = quantity × itemPrice
 * - ค่าออกแบบ = designerPrice (ราคาเหมา ไม่คูณจำนวน)
 * - ราคารวม = ค่าผลิต + ค่าออกแบบ
 */
export function calculateItemPrice(item: OrderItemPrice): OrderItemPriceResult {
    const quantity = Math.max(0, item.quantity || 0)
    const itemPrice = Math.max(0, item.itemPrice || 0)
    const designerPrice = Math.max(0, item.designerPrice || 0)

    const sumItemPrice = quantity * itemPrice
    const totalPrice = sumItemPrice + designerPrice // ค่าออกแบบไม่คูณจำนวน

    return {
        sumItemPrice: roundPrice(sumItemPrice),
        totalPrice: roundPrice(totalPrice),
    }
}

/**
 * คำนวณราคาอุปกรณ์ (Material)
 */
export function calculateMaterialPrice(material: MaterialPrice): MaterialPriceResult {
    const quantity = Math.max(0, material.quantity || 0)
    const price = Math.max(0, material.price || 0)

    return {
        totalPrice: roundPrice(quantity * price),
    }
}

/**
 * คำนวณราคารวมทั้ง Order
 */
export function calculateOrderPrice(input: OrderPriceInput): OrderPriceResult {
    // คำนวณรวมราคาชิ้นงานทั้งหมด
    const itemsTotal = input.items.reduce((sum, item) => {
        const result = calculateItemPrice(item)
        return sum + result.totalPrice
    }, 0)

    // คำนวณรวมราคาอุปกรณ์ทั้งหมด
    const materialsTotal = (input.materials || []).reduce((sum, material) => {
        const result = calculateMaterialPrice(material)
        return sum + result.totalPrice
    }, 0)

    // รวมก่อนหักส่วนลด
    const subtotal = itemsTotal + materialsTotal

    // ส่วนลด (ไม่เกินราคารวม)
    const discount = Math.min(Math.max(0, input.discount || 0), subtotal)

    // ราคาหลังหักส่วนลด
    const afterDiscount = subtotal - discount

    // ค่าขนส่ง
    const shippingPrice = Math.max(0, input.shippingPrice || 0)

    // ราคารวมสุทธิ
    const grandTotal = afterDiscount + shippingPrice

    // ชำระแล้ว
    const paid = Math.max(0, input.paid || 0)

    // คงเหลือ
    const remaining = Math.max(0, grandTotal - paid)

    return {
        itemsTotal: roundPrice(itemsTotal),
        materialsTotal: roundPrice(materialsTotal),
        subtotal: roundPrice(subtotal),
        discount: roundPrice(discount),
        afterDiscount: roundPrice(afterDiscount),
        shippingPrice: roundPrice(shippingPrice),
        grandTotal: roundPrice(grandTotal),
        paid: roundPrice(paid),
        remaining: roundPrice(remaining),
    }
}

// ==================== Helper Functions ====================

/**
 * ปัดเศษราคาให้เป็น 2 ตำแหน่ง
 */
export function roundPrice(value: number): number {
    return Math.round(value * 100) / 100
}

/**
 * Format ราคาเป็นสกุลเงินไทย
 */
export function formatPrice(value: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Format ราคาเป็นตัวเลขพร้อม comma
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
}

/**
 * Parse string เป็น number สำหรับราคา
 */
export function parsePrice(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
        return 0
    }
    const parsed = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
    return isNaN(parsed) ? 0 : parsed
}

// ==================== Validation ====================

/**
 * ตรวจสอบว่าราคาถูกต้อง
 */
export function isValidPrice(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0
}

/**
 * ตรวจสอบว่าจำนวนถูกต้อง
 */
export function isValidQuantity(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0 && Number.isInteger(value)
}
