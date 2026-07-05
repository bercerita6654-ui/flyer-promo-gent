export interface ProductItem {
  sku: string;
  product: string;
  brand: string;
}

// Global typing extension
declare global {
  interface Window {
    cachedProducts?: ProductItem[];
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function cleanCsvValue(val: string): string {
  return val.trim().replace(/^"|"$/g, '').trim();
}

export async function getOrLoadProducts(): Promise<ProductItem[]> {
  if (window.cachedProducts && window.cachedProducts.length > 0) {
    return window.cachedProducts;
  }

  // 1. Try local storage synced data first
  try {
    const stored = localStorage.getItem('synced_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        window.cachedProducts = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load from local storage synced products:', e);
  }

  // 2. Fallback to local fallback-products.json static asset
  try {
    const res = await fetch('/fallback-products.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        window.cachedProducts = data;
        return data;
      }
    }
  } catch (err) {
    console.error('Failed to fetch fallback-products.json:', err);
  }

  // 3. Absolute hardcoded fallback if everything fails
  const absoluteFallback: ProductItem[] = [
    { sku: "19163", product: '3M DOUBLE TAPE FOAM INDOOR 1/2" 110-S12 2.8 Kg', brand: "3M" },
    { sku: "16987", product: '3M DOUBLE TAPE FOAM SCOTCH INDOOR 1" 110-M25 6.0KG', brand: "3M" },
    { sku: "17627", product: '3M DOUBLE TAPE FOAM SCOTCH INDOOR 1/2" 110-M12 2.8kg (12MM x 4M)', brand: "3M" },
    { sku: "17626", product: '3M DOUBLE TAPE SCOTCH OUTDOOR 3.3kg 19mm*1.5m ( 411-S19 )', brand: "3M" },
    { sku: "16772", product: '3M DOUBLE TAPE SIDE MOUNTING CLEAR 1" 410-S19 3.3kg', brand: "3M" },
    { sku: "07945", product: "ACCO FASTENER BESI POP1", brand: "POP1" },
    { sku: "09792", product: "ACCO FASTENER PUTIH JOYKO ( PF-50W )", brand: "JOYKO" },
    { sku: "00003", product: "ACCO FASTENER PUTIH V-TECH", brand: "V-TECH" },
    { sku: "09836", product: "ACCO FASTENER WARNA JOYKO ( PF-50C )", brand: "JOYKO" }
  ];
  window.cachedProducts = absoluteFallback;
  return absoluteFallback;
}

export async function syncProductsFromGoogleSheets(): Promise<{ success: boolean; count: number; note?: string }> {
  try {
    const primaryUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
    
    const response = await fetch(primaryUrl);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const text = await response.text();
    const lines = text.split('\n');
    const items: ProductItem[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === "") continue;
      
      const cols = parseCsvLine(line);
      const sku = cols[0];     // Column 1 (index 0)
      const product = cols[2]; // Column 3 (index 2)
      const brand = cols[6];   // Column 7 (index 6)
      
      if (product && product.trim() !== "" && product !== 'Description') {
        items.push({
          sku: cleanCsvValue(sku || ''),
          product: cleanCsvValue(product),
          brand: cleanCsvValue(brand || '')
        });
      }
    }

    if (items.length > 0) {
      window.cachedProducts = items;
      try {
        localStorage.setItem('synced_products', JSON.stringify(items));
      } catch (e) {
        console.warn('Storage quota exceeded or private browsing active, keeping in memory only.', e);
      }
      return { success: true, count: items.length };
    } else {
      throw new Error('CSV yielded 0 items');
    }
  } catch (err: any) {
    console.error('Failed to sync Google Sheet directly from browser:', err);
    
    // Fallback: check if we have existing storage synced items, or load fallback-products
    const localDb = await getOrLoadProducts();
    return {
      success: true,
      count: localDb.length,
      note: "Menggunakan database cadangan produk lokal karena sinkronisasi Google Sheet langsung terhalang CORS atau jaringan."
    };
  }
}
