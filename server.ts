import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const resolvedFilename = typeof __filename !== "undefined"
  ? __filename
  : (typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "");

const resolvedDirname = typeof __dirname !== "undefined"
  ? __dirname
  : (resolvedFilename ? path.dirname(resolvedFilename) : process.cwd());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Products Caching and CSV parsing logic for Google Sheet STOCK LIST
  let cachedProducts: Array<{ sku: string, product: string, brand: string }> = [];
  let lastFetchTime = 0;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

  // Preload from local fallback file on startup so we are never empty
  try {
    let fallbackPath = path.join(process.cwd(), "fallback-products.json");
    if (!fs.existsSync(fallbackPath)) {
      fallbackPath = path.join(resolvedDirname, "../fallback-products.json");
    }
    if (!fs.existsSync(fallbackPath)) {
      fallbackPath = path.join(resolvedDirname, "fallback-products.json");
    }

    if (fs.existsSync(fallbackPath)) {
      const dataStr = fs.readFileSync(fallbackPath, "utf8");
      cachedProducts = JSON.parse(dataStr);
      console.log(`Preloaded ${cachedProducts.length} fallback products successfully from: ${fallbackPath}`);
    } else {
      console.error("Warning: Could not find fallback-products.json in any expected paths.");
    }
  } catch (preloadErr) {
    console.error("Failed to preload fallback products:", preloadErr);
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

  let isFetchingBackground = false;

  async function fetchProductsBackground() {
    if (isFetchingBackground) return;
    isFetchingBackground = true;
    
    try {
      console.log("Asynchronously fetching fresh products list from Google Sheets...");
      // User's requested exact STOCK LIST sheet tab
      const primaryUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
      const fallbackUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
      
      let response = await fetch(primaryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.warn(`Primary URL fetch returned status ${response.status}. Trying fallback URL...`);
        response = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
      
      if (!response.ok) throw new Error(`Failed to fetch CSV from Google Sheet, status: ${response.status}`);
      
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

      console.log(`Successfully cached ${items.length} fresh products from Google Sheets in background.`);
      if (items.length > 0) {
        cachedProducts = items;
        lastFetchTime = Date.now();
        
        // Update fallback file so we keep the local file fresh
        try {
          let fallbackPath = path.join(process.cwd(), "fallback-products.json");
          if (!fs.existsSync(fallbackPath)) {
            fallbackPath = path.join(__dirname, "../fallback-products.json");
          }
          if (!fs.existsSync(fallbackPath)) {
            fallbackPath = path.join(__dirname, "fallback-products.json");
          }
          fs.writeFileSync(fallbackPath, JSON.stringify(items, null, 2), "utf8");
        } catch (errWrite) {
          console.error("Failed to write to fallback-products.json:", errWrite);
        }
      } else {
        console.warn("Fetched CSV yielded 0 items. Keeping existing cached items.");
      }
    } catch (err) {
      console.error('Error fetching products from Google Sheet in background:', err);
    } finally {
      isFetchingBackground = false;
    }
  }

  function getProducts() {
    const now = Date.now();
    // If we have no cached products, load the ultimate hardcoded fallback list of 9 items
    if (cachedProducts.length === 0) {
      cachedProducts = [
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
    }
    
    // Trigger background fetch if it's been more than 10 minutes or lastFetchTime is 0 (first request)
    if (now - lastFetchTime > CACHE_TTL) {
      fetchProductsBackground().catch(console.error);
    }
    
    return cachedProducts;
  }

  // Search Endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const q = (req.query.q as string || '').toLowerCase().trim();
      const products = await getProducts();
      
      if (!q) {
        // Return first 100 default products if query is empty
        return res.json(products.slice(0, 100));
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

  // Forced Refresh API Route
  app.post("/api/products/refresh", async (req, res) => {
    try {
      console.log("Forced refresh of products CSV requested...");
      const primaryUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
      const fallbackUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCxz1GPm7QU9IS1yBiSjvIdNTLUsvvplOCyT_R3XH4O-LuVbHoY_bXn1LTH5lpnlolJ29BhUgEdnFm/pub?output=csv&gid=1564332470';
      
      let response = await fetch(primaryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        response = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
      
      if (!response.ok) throw new Error(`Failed to fetch CSV from Google Sheet, status: ${response.status}`);
      
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

      if (items.length > 0) {
        cachedProducts = items;
        lastFetchTime = Date.now();
        
        // Write to fallback file to persist
        try {
          let fallbackPath = path.join(process.cwd(), "fallback-products.json");
          if (!fs.existsSync(fallbackPath)) {
            fallbackPath = path.join(resolvedDirname, "../fallback-products.json");
          }
          if (!fs.existsSync(fallbackPath)) {
            fallbackPath = path.join(resolvedDirname, "fallback-products.json");
          }
          fs.writeFileSync(fallbackPath, JSON.stringify(items, null, 2), "utf8");
        } catch (errWrite) {
          console.error("Failed to write to fallback-products.json during forced refresh:", errWrite);
        }
        return res.json({ success: true, count: items.length });
      } else {
        return res.status(400).json({ error: "No products found in fetched CSV" });
      }
    } catch (err: any) {
      console.warn("Forced refresh Google Sheet fetch failed, using local fallback-products.json:", err.message);
      try {
        let fallbackPath = path.join(process.cwd(), "fallback-products.json");
        if (!fs.existsSync(fallbackPath)) {
          fallbackPath = path.join(resolvedDirname, "../fallback-products.json");
        }
        if (!fs.existsSync(fallbackPath)) {
          fallbackPath = path.join(resolvedDirname, "fallback-products.json");
        }
        
        if (fs.existsSync(fallbackPath)) {
          const dataStr = fs.readFileSync(fallbackPath, "utf8");
          const localItems = JSON.parse(dataStr);
          if (localItems && localItems.length > 0) {
            cachedProducts = localItems;
            lastFetchTime = Date.now();
            return res.json({ 
              success: true, 
              count: localItems.length, 
              note: "Google Sheet sedang offline atau tidak dapat diakses. Sinkronisasi dialihkan menggunakan database produk cadangan lokal."
            });
          }
        }
      } catch (localErr: any) {
        console.error("Local fallback load also failed:", localErr);
      }
      return res.status(500).json({ error: `Gagal sinkronisasi: ${err.message || "Gagal mengunduh Google Sheet"}` });
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
        generateVariations,
        complexityLevel
      } = req.body;

      if (!productName || !productName.trim()) {
        return res.status(400).json({ error: "Nama / jenis produk wajib diisi." });
      }

      const cleanBrand = brandName ? brandName.trim() : "";
      const cleanProduct = productName.trim();
      const cleanPkg = packagingInfo ? packagingInfo.trim() : "";
      const cleanColor = colorTheme ? colorTheme.trim() : "harmonious and modern";
      const cleanProps = backgroundProps ? backgroundProps.trim() : "subtle matching elements";
      
      const ratioStr = aspectRatio || "1:1";
      const platform = aiPlatform || "midjourney";
      const complexity = complexityLevel || "advanced";

      // Camera Angle & Lighting Label Mapping for extra descriptive detail
      const cameraAngleText = cameraAngle || "professional eye-level studio photography";
      const lightingText = lighting || "professional studio softbox lighting";

      // Style details
      const styleDescMap = {
        umum: {
          eng: "Clean, professional corporate design, balanced high contrast layout, modern typography arrangement",
          indo: "Desain profesional bersih, tata letak kontras seimbang, susunan tipografi modern"
        },
        anak: {
          eng: "Bright, playful, vibrant pastel color palette, cheerful child-friendly elements and soft cartoonish accents",
          indo: "Cerah, ceria, palet warna pastel cerah, elemen ramah anak yang menyenangkan dan aksen kartun lembut"
        },
        dewasa: {
          eng: "Ultra-premium luxury aesthetic, elegant dark theme, subtle gold/bronze metallic accents, sophisticated clean branding lines",
          indo: "Estetika mewah ultra-premium, tema gelap elegan, aksen logam emas/perunggu halus, garis merek bersih yang canggih"
        }
      };

      const styleDesc = styleDescMap[designStyle as 'umum' | 'anak' | 'dewasa'] || styleDescMap.umum;

      // Platform specific prompt tuning
      let platformTag = "";
      if (platform === "midjourney") {
        platformTag = `--ar ${ratioStr} --v 6.0 --stylize 250`;
      } else if (platform === "sdxl") {
        platformTag = `photorealistic masterpiece, highly detailed, aspect ratio ${ratioStr}`;
      } else if (platform === "google-imagen") {
        platformTag = `high-fidelity commercial render, perfect proportions, ratio ${ratioStr}`;
      } else {
        platformTag = `high quality commercial visual, ratio ${ratioStr}`;
      }

      // Build individual prompt parts
      const buildPrompts = (styleOverride?: string) => {
        let activeStyleEng = styleDesc.eng;
        let activeStyleIndo = styleDesc.indo;

        if (styleOverride === "Modern Minimalist") {
          activeStyleEng = "Modern minimalist design, clean workspace setting, generous elegant negative space, high-key bright lighting, soft pastel accents, extremely organized composition";
          activeStyleIndo = "Desain minimalis modern, latar tempat kerja bersih, ruang kosong negatif yang elegan, pencahayaan terang benderang, aksen pastel lembut, komposisi yang sangat rapi";
        } else if (styleOverride === "Cinematic Dramatic") {
          activeStyleEng = "Cinematic dramatic catalog photography, moody chiaroscuro dark rim light, deep volumetric shadows, rich dark textured background, hyper-realistic reflections";
          activeStyleIndo = "Fotografi katalog dramatis sinematik, pencahayaan rim gelap chiaroscuro dramatis, bayangan volumetrik mendalam, latar belakang bertekstur gelap, refleksi hiper-realistis";
        } else if (styleOverride === "Bright Commercial") {
          activeStyleEng = "Vibrant bright commercial advertisement, energetic splash of liquid and flying organic ingredients, high-energy dynamic action shot, 3-point bright professional studio lights";
          activeStyleIndo = "Iklan komersial cerah yang dinamis, cipratan cairan energik dan bahan-bahan organik beterbangan, jepretan aksi dinamis berenergi tinggi, lampu studio profesional 3 titik yang terang";
        }

        const brandIntroEng = cleanBrand ? `brand "${cleanBrand}"` : "premium brand";
        const brandIntroIndo = cleanBrand ? `merek "${cleanBrand}"` : "merek premium";

        const pkgSnippetEng = cleanPkg ? `Product Packaging Design: ${cleanPkg}. ` : "";
        const pkgSnippetIndo = cleanPkg ? `Desain Kemasan Produk: ${cleanPkg}. ` : "";

        // English Prompts
        let promptEng = `Commercial advertisement product flyer showcase of ${brandIntroEng}'s main product "${cleanProduct}". ` +
          pkgSnippetEng +
          `Aesthetic Theme: ${activeStyleEng}. ` +
          `Color Theme: ${cleanColor}. ` +
          `Camera Perspective: ${cameraAngleText}. ` +
          `Lighting Setup: ${lightingText}. ` +
          `Background Decor & Accents: ${cleanProps}. ` +
          `Composition Grid: 80% beautiful product central focus, 20% clean margins for copy text. ` +
          `Top section displays the product "${cleanProduct}". Middle section showcases key ingredients. Bottom section outlines clear benefits. ` +
          `Highly detailed, hyper-realistic, photorealistic commercial product photography, ${platformTag}`;

        // Indonesian Prompts
        let promptIndo = `Selebaran iklan komersial produk unggulan dari ${brandIntroIndo} yang menampilkan "${cleanProduct}". ` +
          pkgSnippetIndo +
          `Tema Estetika: ${activeStyleIndo}. ` +
          `Tema Warna: ${cleanColor}. ` +
          `Sudut Kamera: ${cameraAngleText}. ` +
          `Pencahayaan: ${lightingText}. ` +
          `Properti & Dekorasi Latar Belakang: ${cleanProps}. ` +
          `Aturan Komposisi: 80% fokus utama pada produk di bagian tengah, 20% ruang kosong di pinggir untuk teks iklan. ` +
          `Bagian atas menampilkan produk "${cleanProduct}". Bagian tengah menunjukkan bahan utama/aksi. Bagian bawah menyediakan tempat untuk info keunggulan produk. ` +
          `Sangat detail, hiper-realistis, fotografi produk komersial berkualitas tinggi, dioptimalkan untuk ${platform.toUpperCase()}`;

        // Complexity Level modifications
        if (complexity === 'simple') {
          promptEng = `Minimalist advertisement for ${brandIntroEng}'s "${cleanProduct}". ${pkgSnippetEng}Setup: ${cameraAngleText}, ${lightingText} on ${cleanColor} background. High-quality product photo.`;
          promptIndo = `Iklan minimalis untuk ${brandIntroIndo} "${cleanProduct}". ${pkgSnippetIndo}Sudut: ${cameraAngleText}, ${lightingText} dengan latar warna ${cleanColor}. Foto produk berkualitas tinggi.`;
        } else if (complexity === 'advanced') {
          promptEng += `, ray tracing, octane render, global illumination, incredibly sharp focus, 8k resolution, cinematic look, depth of field, masterpiece catalog representation`;
          promptIndo += `, ray tracing, octane render, pencahayaan global, fokus sangat tajam, resolusi 8k, tampilan sinematik, efek kedalaman ruang (depth of field), representasi katalog mahakarya`;
        }

        return { promptEng, promptIndo };
      };

      if (generateVariations) {
        const styles = ["Modern Minimalist", "Cinematic Dramatic", "Bright Commercial"];
        const variations = styles.map(style => {
          const { promptEng, promptIndo } = buildPrompts(style);
          return {
            style,
            promptEng,
            promptIndo
          };
        });

        return res.json({
          generateVariations: true,
          variations
        });
      } else {
        const { promptEng, promptIndo } = buildPrompts();
        return res.json({
          generateVariations: false,
          promptEng,
          promptIndo
        });
      }

    } catch (error: any) {
      console.error("Enhance Prompt Error in server.ts:", error);
      return res.status(500).json({ error: error.message || "Gagal merancang prompt iklan." });
    }
  });

  // API Route for generating 30-second advertising script
  app.post("/api/generate-ad-script", async (req, res) => {
    try {
      const {
        brandName,
        productName,
        packagingInfo,
        language,
        colorTheme,
        backgroundProps,
        designStyle,
        voiceTone
      } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "Nama produk wajib diisi." });
      }

      const isIndo = (language || 'indo') === 'indo';
      const cleanBrand = brandName ? brandName.trim() : (isIndo ? "Merek Utama" : "Premium Brand");
      const cleanProduct = productName.trim();
      const cleanPkg = packagingInfo ? packagingInfo.trim() : (isIndo ? "Kemasan Eksklusif" : "Premium Packaging");
      const tone = voiceTone || "Professional";
      const style = designStyle || "umum";
      const colors = colorTheme || (isIndo ? "harmonis" : "harmonious");
      const bg = backgroundProps || (isIndo ? "dekorasi estetik" : "aesthetic decorations");

      // Generate customized Title
      let title = "";
      if (isIndo) {
        title = `Kampanye Hebat ${cleanProduct} - Sentuhan ${tone}`;
      } else {
        title = `The Ultimate ${cleanProduct} Campaign - ${tone} Vibe`;
      }

      // Generate key benefits based on tone
      let keyBenefits: string[] = [];
      let targetAudience = "";

      if (isIndo) {
        targetAudience = `Konsumen modern yang cerdas, menyukai gaya hidup ${style === 'dewasa' ? 'mewah dan elegan' : style === 'anak' ? 'ceria dan aktif' : 'fungsional dan praktis'}.`;
        if (tone === "Professional") {
          keyBenefits = [
            `Kualitas teruji klinis dan tepercaya`,
            `Desain ergonomis dengan material premium`,
            `Hasil optimal yang konsisten setiap saat`
          ];
        } else if (tone === "Energetic") {
          keyBenefits = [
            `Meningkatkan semangat dan energi harian`,
            `Aksi cepat berenergi tinggi`,
            `Gaya hidup aktif tanpa batas`
          ];
        } else if (tone === "Empathetic") {
          keyBenefits = [
            `Sangat mengerti kebutuhan kenyamanan keluarga`,
            `Bahan super lembut dan aman untuk kulit sensitif`,
            `Memberikan ketenangan pikiran sepanjang hari`
          ];
        } else if (tone === "Persuasive") {
          keyBenefits = [
            `Solusi terbaik dengan penawaran terbatas`,
            `Terbukti menghemat waktu dan biaya hingga 50%`,
            `Direkomendasikan oleh ribuan pelanggan setia`
          ];
        } else { // Humorous
          keyBenefits = [
            `Solusi anti-ribet penolak hari suram`,
            `Saking praktisnya, bikin tetangga ikutan penasaran`,
            `Menghadirkan senyum ceria di setiap penggunaan`
          ];
        }
      } else {
        targetAudience = `Modern lifestyle enthusiasts looking for a ${style === 'dewasa' ? 'luxurious and premium' : style === 'anak' ? 'fun and active' : 'smart and functional'} solution.`;
        if (tone === "Professional") {
          keyBenefits = [
            `Clinically proven high-grade quality`,
            `Ergonomic layout crafted with premium materials`,
            `Consistent, dependable professional performance`
          ];
        } else if (tone === "Energetic") {
          keyBenefits = [
            `Boosts daily productivity and focus`,
            `Ultra-fast dynamic action response`,
            `Designed for a vibrant, active lifestyle`
          ];
        } else if (tone === "Empathetic") {
          keyBenefits = [
            `Deeply understands family comfort and safety`,
            `100% hypoallergenic and gentle on skin`,
            `Provides endless peace of mind and relief`
          ];
        } else if (tone === "Persuasive") {
          keyBenefits = [
            `Exclusive limited-time offer for smart buyers`,
            `Saves up to 50% of time and maintenance effort`,
            `Endorsed by thousands of certified experts`
          ];
        } else { // Humorous
          keyBenefits = [
            `Zero-stress solution for daily life hacks`,
            `So elegant and funny, it makes you smile`,
            `Guaranteed to keep your mood super bright`
          ];
        }
      }

      // Generate dynamic scenes
      const scenes: Array<{ sceneNumber: number, visual: string, audio: string, duration: string }> = [];
      const narrativeLines: string[] = [];

      if (isIndo) {
        // Scene 1: Hook
        let v1 = `Pembuka (0-5 detik): Kamera menyorot tajam produk ${cleanProduct} dengan kemasan ${cleanPkg} yang diletakkan elegan di atas latar belakang ${bg} bertemakan warna ${colors}.`;
        let a1 = "";
        if (tone === "Energetic") {
          a1 = `[Musik Up-beat Cepat] VO: "Siap mengubah hari Anda? Sambutlah energi luar biasa dari ${cleanProduct}!"`;
        } else if (tone === "Empathetic") {
          a1 = `[Musik Lembut Menenangkan] VO: "Kami tahu betapa berharganya waktu santai Anda. Hadirkan kehangatan nyata dengan ${cleanProduct}."`;
        } else if (tone === "Professional") {
          a1 = `[Musik Korporat Elegan] VO: "Presisi, keandalan, dan inovasi. Memperkenalkan standar terbaru dari ${cleanProduct}."`;
        } else if (tone === "Persuasive") {
          a1 = `[Musik Menghentak Bersemangat] VO: "Jangan lewatkan kesempatan emas ini! Ini dia satu-satunya solusi praktis untuk Anda: ${cleanProduct}!"`;
        } else { // Humorous
          a1 = `[Suara Efek Lucu & Musik Jenaka] VO: "Masih pakai cara lama yang bikin pusing? Aduh, hari gini! Kenalin nih si penyelamat, ${cleanProduct}!"`;
        }
        scenes.push({ sceneNumber: 1, visual: v1, audio: a1, duration: "5s" });
        narrativeLines.push(a1.split('VO: ')[1].replace(/"/g, ''));

        // Scene 2: Feature
        let v2 = `Fitur Utama (5-12 detik): Detail produk diperlihatkan dari dekat (extreme close-up). Tekstur bahan premium, detail pengerjaan, dan kemasan ${cleanPkg} yang kokoh terlihat memukau dengan pencahayaan profesional berkilau.`;
        let a2 = `[Efek SFX Transisi] VO: "Dibuat dengan dedikasi penuh oleh ${cleanBrand}, setiap detail dirancang khusus untuk kenyamanan maksimal Anda."`;
        scenes.push({ sceneNumber: 2, visual: v2, audio: a2, duration: "7s" });
        narrativeLines.push(a2.split('VO: ')[1].replace(/"/g, ''));

        // Scene 3: Practical Use / Benefit
        let v3 = `Aksi / Manfaat (12-20 detik): Seseorang mengoperasikan atau menggunakan ${cleanProduct} dengan sangat mudah. Terlihat senyum kepuasan dan hasil instan yang memukau di atas latar belakang ${colors}.`;
        let a3 = `[Musik Bertambah Semangat] VO: "${keyBenefits[0]}. Tidak ada lagi keraguan, hanya hasil terbaik yang akan Anda dapatkan!"`;
        scenes.push({ sceneNumber: 3, visual: v3, audio: a3, duration: "8s" });
        narrativeLines.push(a3.split('VO: ')[1].replace(/"/g, ''));

        // Scene 4: Secondary Benefit
        let v4 = `Keunggulan Lebih (20-25 detik): Teks grafis bergaya modern muncul di layar menampilkan poin keunggulan utama: ${keyBenefits[1]} & ${keyBenefits[2]}.`;
        let a4 = `[SFX Denting Lonceng Lembut] VO: "Lebih dari sekadar produk, ini adalah investasi terbaik untuk masa depan Anda yang cerdas."`;
        scenes.push({ sceneNumber: 4, visual: v4, audio: a4, duration: "5s" });
        narrativeLines.push(a4.split('VO: ')[1].replace(/"/g, ''));

        // Scene 5: Call to Action (CTA)
        let v5 = `Penutup / Call to Action (25-30 detik): Logo ${cleanBrand} tampil elegan di tengah layar. Menampilkan info kontak, link website, dan visual megah produk ${cleanProduct} dengan kemasan ${cleanPkg}.`;
        let a5 = `[Musik Penutup Megah] VO: "Dapatkan ${cleanProduct} sekarang juga! Hubungi kami hari ini dan rasakan perbedaannya sendiri!"`;
        scenes.push({ sceneNumber: 5, visual: v5, audio: a5, duration: "5s" });
        narrativeLines.push(a5.split('VO: ')[1].replace(/"/g, ''));

      } else {
        // Scene 1: Hook
        let v1 = `Opening Hook (0-5s): Camera slowly pans across the sleek design of ${cleanProduct} with its gorgeous ${cleanPkg}, perfectly positioned on ${bg} with a premium ${colors} color theme.`;
        let a1 = "";
        if (tone === "Energetic") {
          a1 = `[Up-beat Energetic Music] VO: "Ready to elevate your daily routine? Unleash the incredible power of ${cleanProduct}!"`;
        } else if (tone === "Empathetic") {
          a1 = `[Soft Heartwarming Music] VO: "We understand what true comfort means. Bring home the pure relaxation you deserve with ${cleanProduct}."`;
        } else if (tone === "Professional") {
          a1 = `[Elegant Corporate Music] VO: "Precision, quality, and breakthrough innovation. Introducing the all-new standard: ${cleanProduct}."`;
        } else if (tone === "Persuasive") {
          a1 = `[Driving Powerful Music] VO: "Don't settle for average anymore. Upgrade your lifestyle instantly with the unique ${cleanProduct}!"`;
        } else { // Humorous
          a1 = `[Playful Comedy Sound Effects] VO: "Still struggling with outdated solutions? Stop the madness and say hello to your new best friend, ${cleanProduct}!"`;
        }
        scenes.push({ sceneNumber: 1, visual: v1, audio: a1, duration: "5s" });
        narrativeLines.push(a1.split('VO: ')[1].replace(/"/g, ''));

        // Scene 2: Feature
        let v2 = `Feature Close-Up (5-12s): Extreme close-up shot showcasing the beautiful textures and high-end materials of ${cleanProduct}. The ${cleanPkg} shines under soft studio lights.`;
        let a2 = `[Swoosh SFX] VO: "Masterfully crafted by ${cleanBrand}, every aspect is engineered for your ultimate satisfaction."`;
        scenes.push({ sceneNumber: 2, visual: v2, audio: a2, duration: "7s" });
        narrativeLines.push(a2.split('VO: ')[1].replace(/"/g, ''));

        // Scene 3: Practical Use / Benefit
        let v3 = `Demo / Core Benefit (12-20s): Dynamic demo of ${cleanProduct} being used in a real scenario. Satisfied user smiling as the product delivers excellent instant results.`;
        let a3 = `[Music Swell] VO: "${keyBenefits[0]}. No more hassles, just perfect results every single time."`;
        scenes.push({ sceneNumber: 3, visual: v3, audio: a3, duration: "8s" });
        narrativeLines.push(a3.split('VO: ')[1].replace(/"/g, ''));

        // Scene 4: Secondary Benefit
        let v4 = `Highlights (20-25s): Modern graphics overlay appearing on screen highlighting: ${keyBenefits[1]} & ${keyBenefits[2]}.`;
        let a4 = `[Pristine Chime SFX] VO: "It's more than just a purchase—it's a smart lifestyle investment for your family."`;
        scenes.push({ sceneNumber: 4, visual: v4, audio: a4, duration: "5s" });
        narrativeLines.push(a4.split('VO: ')[1].replace(/"/g, ''));

        // Scene 5: Outro CTA
        let v5 = `Outro CTA (25-30s): Elegant brand display. Clean contact details, website link, and a majestic close-up of ${cleanProduct} in its ${cleanPkg}.`;
        let a5 = `[Inspiring Outro Music] VO: "Get your ${cleanProduct} today! Order now and feel the incredible difference!"`;
        scenes.push({ sceneNumber: 5, visual: v5, audio: a5, duration: "5s" });
        narrativeLines.push(a5.split('VO: ')[1].replace(/"/g, ''));
      }

      const fullNarrative = narrativeLines.join(" ");

      const result = {
        title,
        duration: isIndo ? "30 Detik" : "30 Seconds",
        targetAudience,
        keyBenefits,
        scenes,
        fullNarrative
      };

      return res.json(result);

    } catch (error: any) {
      console.error("Ad Script generation error in server.ts:", error);
      return res.status(500).json({ error: error.message || "Gagal menghasilkan script iklan." });
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
