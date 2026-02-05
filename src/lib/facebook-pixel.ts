// Facebook Pixel utilities - safe loading and event tracking

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

let pixelInitialized = false;
let pixelId: string | null = null;
let testEventCode: string | null = null;

/**
 * Initialize Facebook Pixel - call once on app load
 */
export function initFacebookPixel(
  id: string,
  testCode?: string | null
): boolean {
  if (pixelInitialized) return true;
  if (!id || !/^\d{10,20}$/.test(id)) {
    console.warn('[FB Pixel] Invalid Pixel ID');
    return false;
  }

  // Don't load on admin routes
  if (window.location.pathname.startsWith('/admin')) {
    return false;
  }

  try {
    pixelId = id;
    testEventCode = testCode || null;

    // Facebook Pixel base code
    const f = window;
    const b = document;
    const e = 'script';
    
    if (f.fbq) return true;

    const n: any = (f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    });

    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);

    // Initialize pixel
    window.fbq('init', pixelId);
    
    pixelInitialized = true;
    console.log('[FB Pixel] Initialized:', pixelId);
    
    return true;
  } catch (error) {
    console.warn('[FB Pixel] Failed to initialize:', error);
    return false;
  }
}

/**
 * Check if pixel is ready to track
 */
export function isPixelReady(): boolean {
  return pixelInitialized && typeof window.fbq === 'function';
}

/**
 * Track a standard or custom event
 */
function trackEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
): void {
  if (!isPixelReady()) return;
  if (window.location.pathname.startsWith('/admin')) return;

  try {
    const eventParams = { ...params };
    
    // Add test event code if present
    if (testEventCode) {
      eventParams.test_event_code = testEventCode;
    }

    if (eventId) {
      window.fbq('track', eventName, eventParams, { eventID: eventId });
    } else {
      window.fbq('track', eventName, eventParams);
    }
    
    console.log(`[FB Pixel] Event: ${eventName}`, eventParams);
  } catch (error) {
    console.warn(`[FB Pixel] Failed to track ${eventName}:`, error);
  }
}

/**
 * Track PageView event
 */
export function trackPageView(): void {
  trackEvent('PageView');
}

/**
 * Track ViewContent event (product page view)
 */
export function trackViewContent(params: {
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
}): void {
  trackEvent('ViewContent', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: 'product',
    value: params.value,
    currency: params.currency,
  });
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(params: {
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
  quantity: number;
}): void {
  trackEvent('AddToCart', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: 'product',
    value: params.value,
    currency: params.currency,
    quantity: params.quantity,
  });
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(params: {
  numItems: number;
  value: number;
  currency: string;
}): void {
  trackEvent('InitiateCheckout', {
    num_items: params.numItems,
    value: params.value,
    currency: params.currency,
  });
}

/**
 * Track Purchase event
 */
export function trackPurchase(params: {
  orderId: string;
  value: number;
  currency: string;
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
}): void {
  trackEvent(
    'Purchase',
    {
      value: params.value,
      currency: params.currency,
      contents: params.contents,
      content_type: 'product',
      order_id: params.orderId,
    },
    params.orderId // Use order ID as event ID for deduplication
  );
}

/**
 * Track Search event
 */
export function trackSearch(searchString: string): void {
  if (!searchString.trim()) return;
  trackEvent('Search', {
    search_string: searchString.trim(),
  });
}

/**
 * Validate Pixel ID format
 */
export function validatePixelId(id: string): boolean {
  return /^\d{10,20}$/.test(id);
}

/**
 * Test pixel connectivity (for admin validation)
 */
export function testPixelConnection(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!validatePixelId(id)) {
      resolve(false);
      return;
    }

    // Create a test image request to check if pixel can be reached
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
    
    img.src = `https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1&_=${Date.now()}`;
  });
}
