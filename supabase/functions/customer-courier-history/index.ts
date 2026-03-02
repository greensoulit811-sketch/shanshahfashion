import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourierMetrics {
  total_parcels: number
  delivered_count: number
  returned_count: number
  cancelled_count: number
  in_transit_count: number
  success_rate: number
  return_rate: number
  last_delivery_date: string | null
  last_status: string | null
  recent_parcels: Array<{
    order_number: string
    tracking_id: string | null
    status: string
    courier_status: string | null
    created_at: string
    total: number
  }>
}

function normalizeStatus(courierStatus: string | null, orderStatus: string): string {
  const cs = (courierStatus || '').toLowerCase()
  if (cs === 'delivered' || orderStatus === 'delivered') return 'delivered'
  if (cs === 'cancelled' || cs === 'cancelled_delivery' || orderStatus === 'cancelled') return 'cancelled'
  if (cs === 'partial_delivered' || cs === 'unknown') return 'returned'
  if (cs === 'in_review' || cs === 'pending' || cs === 'picked' || cs === 'in_transit') return 'in_transit'
  if (orderStatus === 'shipped') return 'in_transit'
  if (orderStatus === 'pending' || orderStatus === 'confirmed' || orderStatus === 'processing') return 'pending'
  return 'pending'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user is staff
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: isStaff } = await supabase.rpc('has_any_staff_role', { _user_id: user.id })
    if (!isStaff) {
      return new Response(JSON.stringify({ error: 'Staff access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const phone = url.searchParams.get('phone')
    const forceRefresh = url.searchParams.get('refresh') === 'true'

    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize phone: keep last 10 digits for matching
    const normalizedPhone = phone.replace(/[^0-9]/g, '').slice(-10)

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('customer_courier_history')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle()

      if (cached && new Date(cached.cache_expire_at) > new Date()) {
        return new Response(JSON.stringify({
          success: true,
          cached: true,
          data: {
            total_parcels: cached.total_parcels,
            delivered_count: cached.delivered_count,
            returned_count: cached.returned_count,
            cancelled_count: cached.cancelled_count,
            in_transit_count: cached.in_transit_count,
            success_rate: Number(cached.success_rate),
            return_rate: Number(cached.return_rate),
            last_delivery_date: cached.last_delivery_date,
            last_status: cached.last_status,
            recent_parcels: cached.recent_parcels,
          },
          last_checked_at: cached.last_checked_at,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // Query all orders for this phone number (match last 10 digits)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, courier_status, courier_tracking_id, courier_provider, created_at, total, updated_at')
      .order('created_at', { ascending: false })

    if (ordersError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Filter by phone (match last 10 digits) - we need to fetch phone separately
    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, order_number, status, courier_status, courier_tracking_id, courier_provider, created_at, total, updated_at, customer_phone')
      .order('created_at', { ascending: false })
      .limit(500)

    const matchedOrders = (allOrders || []).filter(o => {
      const orderPhone = o.customer_phone.replace(/[^0-9]/g, '').slice(-10)
      return orderPhone === normalizedPhone
    })

    // Compute metrics
    let delivered = 0, returned = 0, cancelled = 0, inTransit = 0
    let lastDeliveryDate: string | null = null

    for (const o of matchedOrders) {
      const normalized = normalizeStatus(o.courier_status, o.status)
      if (normalized === 'delivered') {
        delivered++
        if (!lastDeliveryDate || o.updated_at > lastDeliveryDate) {
          lastDeliveryDate = o.updated_at
        }
      }
      else if (normalized === 'returned') returned++
      else if (normalized === 'cancelled') cancelled++
      else if (normalized === 'in_transit') inTransit++
    }

    const totalParcels = matchedOrders.length
    const successRate = totalParcels > 0 ? Math.round((delivered / totalParcels) * 100 * 100) / 100 : 0
    const returnRate = totalParcels > 0 ? Math.round((returned / totalParcels) * 100 * 100) / 100 : 0

    const recentParcels = matchedOrders.slice(0, 5).map(o => ({
      order_number: o.order_number,
      tracking_id: o.courier_tracking_id,
      status: o.status,
      courier_status: o.courier_status,
      created_at: o.created_at,
      total: o.total,
    }))

    const metrics: CourierMetrics = {
      total_parcels: totalParcels,
      delivered_count: delivered,
      returned_count: returned,
      cancelled_count: cancelled,
      in_transit_count: inTransit,
      success_rate: successRate,
      return_rate: returnRate,
      last_delivery_date: lastDeliveryDate,
      last_status: matchedOrders[0]?.courier_status || matchedOrders[0]?.status || null,
      recent_parcels: recentParcels,
    }

    // Upsert cache
    const cacheExpire = new Date()
    cacheExpire.setHours(cacheExpire.getHours() + 24)

    await supabase.from('customer_courier_history').upsert({
      phone: normalizedPhone,
      total_parcels: metrics.total_parcels,
      delivered_count: metrics.delivered_count,
      returned_count: metrics.returned_count,
      cancelled_count: metrics.cancelled_count,
      in_transit_count: metrics.in_transit_count,
      success_rate: metrics.success_rate,
      return_rate: metrics.return_rate,
      last_delivery_date: metrics.last_delivery_date,
      last_status: metrics.last_status,
      recent_parcels: recentParcels,
      last_checked_at: new Date().toISOString(),
      cache_expire_at: cacheExpire.toISOString(),
    }, { onConflict: 'phone' })

    return new Response(JSON.stringify({
      success: true,
      cached: false,
      data: metrics,
      last_checked_at: new Date().toISOString(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
