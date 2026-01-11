import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// API สำหรับดึงข้อมูลสถิติจาก Supabase
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      )
    }

    // ดึงข้อมูล orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, price, status_code, payment_status_code, created_date')

    if (ordersError) {
      console.error('Orders error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // ดึงข้อมูล members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, status')

    if (membersError) {
      console.error('Members error:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    // ดึงข้อมูล claims
    const { data: claims, error: claimsError } = await supabase
      .from('claim_order')
      .select('id')

    if (claimsError) {
      console.error('Claims error:', claimsError)
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      )
    }

    // คำนวณสถิติ
    const totalOrders = orders?.length || 0
    const totalAmount = orders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0
    const activeMembers = members?.filter(m => m.status === true).length || 0
    const totalClaims = claims?.length || 0

    // สถิติตาม status
    const byStatus: Record<string, number> = {}
    const byPaymentStatus: Record<string, number> = {}

    orders?.forEach(order => {
      const status = order.status_code || 'Unknown'
      const paymentStatus = order.payment_status_code || 'Unknown'
      
      byStatus[status] = (byStatus[status] || 0) + 1
      byPaymentStatus[paymentStatus] = (byPaymentStatus[paymentStatus] || 0) + 1
    })

    // ออเดอร์ล่าสุด (5 รายการ)
    const recentOrders = orders
      ?.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
      ?.slice(0, 5)
      ?.map(order => ({
        id: order.id,
        fullName: `ออเดอร์ #${order.id}`,
        price: order.price || 0,
        createdAt: order.created_date,
        statusCode: order.status_code,
        paymentStatusCode: order.payment_status_code,
      })) || []

    return NextResponse.json({
      success: true,
      statistics: {
        total: totalOrders,
        totalAmount,
        byStatus,
        byPaymentStatus,
        recentOrders,
      },
      members: {
        total: members?.length || 0,
        active: activeMembers,
      },
      claims: {
        total: totalClaims,
      },
    })
  } catch (error: any) {
    console.error('Statistics API error:', error)
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    )
  }
}
