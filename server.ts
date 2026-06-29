import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google Gen AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Products Caching and CSV parsing logic for Google Sheet STOCK LIST
  let cachedProducts: Array<{ sku: string, product: string, brand: string }> = [];
  let lastFetchTime = 0;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

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

  async function getProducts() {
    const now = Date.now();
    if (cachedProducts.length > 0 && (now - lastFetchTime < CACHE_TTL)) {
      return cachedProducts;
    }

    try {
      console.log("Fetching fresh products list from Google Sheets...");
      const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch CSV from Google Sheet');
      
      const text = await response.text();
      const lines = text.split('\n');
      const items: Array<{ sku: string, product: string, brand: string }> = [];
      
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

      console.log(`Successfully cached ${items.length} products.`);
      cachedProducts = items;
      lastFetchTime = now;
      return cachedProducts;
    } catch (err) {
      console.error('Error fetching products from Google Sheet:', err);
      return cachedProducts; // fallback to stale cache
    }
  }

  // Search Endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const q = (req.query.q as string || '').toLowerCase().trim();
      const products = await getProducts();
      
      if (!q) {
        // Return first 50 default products if query is empty
        return res.json(products.slice(0, 50));
      }
      
      const words = q.split(/\s+/).filter(Boolean);
      const filtered = products.filter(item => {
        const prodLower = item.product.toLowerCase();
        const brandLower = item.brand.toLowerCase();
        const skuLower = item.sku.toLowerCase();
        return words.every(word => 
          prodLower.includes(word) || 
          brandLower.includes(word) || 
          skuLower.includes(word)
        );
      });
      
      return res.json(filtered.slice(0, 100));
    } catch (error: any) {
      console.error("Search API Error:", error);
      return res.status(500).json({ error: "Failed to search products" });
    }
  });

  // API Routes
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { 
        brandName, 
        productName, 
        packagingInfo, 
        designStyle, 
        aspectRatio, 
        aiPlatform, 
        colorTheme, 
        cameraAngle, 
        lighting, 
        backgroundProps,
        generateVariations
      } = req.body;

      if (!productName || !packagingInfo) {
        return res.status(400).json({ error: "Nama produk dan detail kemasan wajib diisi." });
      }

      const styleLabels = {
        umum: "Clean, professional, high-contrast, modern layout, corporate / mainstream audience",
        anak: "Bright, cheerful, vivid pastel colors, playful elements, soft lighting, kid-friendly mascot elements",
        dewasa: "Luxury, premium, elegant dark / rich theme, gold accents, sophisticated clean lines, mature high-end branding"
      };

      const selectedStyle = styleLabels[designStyle as 'umum' | 'anak' | 'dewasa'] || styleLabels.umum;

      let promptTemplate = "";
      if (generateVariations) {
        promptTemplate = `
        You are an expert AI Image Prompt designer specializing in commercial advertising photography, product flyers, and graphic design layout structure.
        
        Generate THREE (3) distinct, highly detailed, professional creative variations of the same product flyer prompt based on these base details:
        - Brand Name: ${brandName || "Unspecified Brand"}
        - Product Name: ${productName}
        - Packaging Details: ${packagingInfo}
        - Aspect Ratio: ${aspectRatio}
        - AI Engine: ${aiPlatform}
        - Base Colors: ${colorTheme || "harmonious and visually striking"}

        You must generate exactly these 3 styles of prompt variations:
        1. "Modern Minimalist": Focus on high-end clean workspace, generous negative space, high-key soft studio lighting, soft color theme, elegant placement, minimalist aesthetic.
        2. "Cinematic Dramatic": Focus on rich moody lighting (chiaroscuro, rim light, deep contrasts, volumetric fog / particles), dark textured background, dramatic camera angle, high reflections, cinematic catalog feeling.
        3. "Bright Commercial": Focus on vivid colors, vibrant dynamic elements (splash of liquid, flying organic ingredients, action feeling), bright 3-point studio lighting, extremely energetic, appealing for digital ads.

        For EACH variation, please construct BOTH an English prompt ("promptEng", rich in descriptive tags optimized for ${aiPlatform}) and an Indonesian version ("promptIndo", clean copywriting and layout guidelines).

        Flyer layout guidelines to integrate into the prompts:
        - Composition: 80% beautiful product focal point with packaging, and 20% clean negative space panels for contact info/text.
        - Top Section: Majestic display of the main product "${productName}" ${brandName ? `by "${brandName}"` : ""}.
        - Middle Section: A clean grid showing feature icons, and floating ingredients or interactive action shots.
        - Bottom Section: Space for step-by-step "how to use" visuals and key benefit cards.
        - Style requirements: Extremely sharp, realistic, no distorted items, neat margins.

        Response format MUST be a single raw JSON object with a single key "variations" which contains an array of exactly 3 objects.
        Each object in the array must have exactly these keys: "style", "promptEng", and "promptIndo".
        "style" must match exactly "Modern Minimalist", "Cinematic Dramatic", or "Bright Commercial".
        Do not include any markdown fences, backticks, or text before/after the JSON.
        `;
      } else {
        promptTemplate = `
        You are an expert AI Image Prompt designer specializing in commercial advertising photography, product flyers, and graphic design layout structure.
        
        Generate a highly detailed, professional, and eye-catching image generation prompt based on these details:
        - Brand Name: ${brandName || "Unspecified Brand"}
        - Product Name: ${productName}
        - Packaging Details: ${packagingInfo}
        - Target Design Style: ${selectedStyle}
        - Aspect Ratio: ${aspectRatio}
        - AI Engine: ${aiPlatform}
        - Colors: ${colorTheme || "harmonious and visually striking"}
        - Camera Angle: ${cameraAngle || "professional eye-level advertising studio portrait shot"}
        - Lighting: ${lighting || "professional softbox photography lighting"}
        - Background Props / Decor: ${backgroundProps || "organic matching decorations"}

        Please construct TWO high-quality prompts:
        1. "promptEng": An English prompt. Must be rich in sensory descriptive modifiers (such as "octane render, raytracing reflections, photorealistic textures, atmospheric haze, studio catalog composition, depth of field, 8k resolution"). Ensure aspect ratio and platform optimized tags are present.
        2. "promptIndo": An Indonesian translation / version of this premium prompt, written with professional local copywriting terms, explaining clearly the flyer layout.

        Flyer layout guidelines to integrate into the prompts:
        - Composition: 80% beautiful product focal point with packaging, and 20% clean negative space panels for contact info/text.
        - Top Section: Majestic display of the main product "${productName}" ${brandName ? `by "${brandName}"` : ""}.
        - Middle Section: A clean grid showing feature icons, and floating ingredients or interactive action shots.
        - Bottom Section: Space for step-by-step "how to use" visuals and key benefit cards.
        - Style requirements: Extremely sharp, realistic, no distorted items, neat margins.

        Response format MUST be a single raw JSON object with exactly two keys: "promptEng" and "promptIndo". Do not include any markdown fences or explanation before/after.
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptTemplate,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);

      if (generateVariations) {
        return res.json({
          generateVariations: true,
          variations: result.variations || []
        });
      } else {
        return res.json({
          generateVariations: false,
          promptEng: result.promptEng || "",
          promptIndo: result.promptIndo || ""
        });
      }

    } catch (error: any) {
      console.error("Gemini API Error in server.ts:", error);
      return res.status(500).json({ error: error.message || "Gagal merancang prompt dengan Gemini AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
