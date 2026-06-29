import { PromptInput } from './types';

export const CAMERA_ANGLES = [
  { value: 'studio-portrait', label: '📸 Studio Portrait (Eye-Level)', labelIndo: 'Foto Portrait Studio (Sejajar Mata)', labelEng: 'professional eye-level studio product portrait photography, catalog style composition' },
  { value: 'flatlay', label: '📐 Flatlay (Aesthetic Top-Down)', labelIndo: 'Gaya Flatlay Estetik dari Atas', labelEng: 'aesthetic flatlay top-down view, meticulously organized layout, geometric placement' },
  { value: 'macro-detail', label: '🔍 Macro Close-up (Detail Tekstur)', labelIndo: 'Fokus Makro Close-up Ekstrim', labelEng: 'extreme macro close-up focus, showcasing ultra-fine physical textures and crisp product details' },
  { value: 'dynamic-low', label: '⚡ Dynamic Low-Angle (Heroic)', labelIndo: 'Sudut Pandah Rendah Dinamis', labelEng: 'dynamic dramatic low angle shot, making the product look heroic, powerful, and grand' },
];

export const LIGHTINGS = [
  { value: 'softbox-studio', label: '💡 Softbox Studio (Bersih & Rata)', labelIndo: 'Pencahayaan Softbox Studio Bersih', labelEng: 'professional clean softbox studio lighting, seamless commercial catalogue style' },
  { value: 'warm-chiaroscuro', label: '🌅 Warm Chiaroscuro (Kontras Bayangan)', labelIndo: 'Chiaroscuro Hangat Dramatis', labelEng: 'dramatic warm chiaroscuro studio lighting, moody artistic shadows and premium golden high contrast' },
  { value: 'natural-sunlight', label: '🌿 Natural Sunlight (Estetik Jendela)', labelIndo: 'Sinar Matahari Alami & Bayangan Daun', labelEng: 'soft natural sunlight filtering through window blinds, aesthetic warm organic shadow play' },
  { value: 'cinematic-glow', label: '✨ Futuristic Cinematic Rim Light', labelIndo: 'Cinematic Rim Light Neon Lembut', labelEng: 'futuristic cinematic glow, glowing rim lights, cyber soft ambient neon luminescence, octane render' },
];

export function getIndoStylePrompt(style: string) {
  if (style === 'anak') {
    return 'Kualitas tinggi, resolusi 8k, fotografi iklan komersial, pencahayaan studio cerah dan ceria, penuh warna, elemen playful, bentuk lembut ramah anak, atmosfer riang gembira.';
  } else if (style === 'dewasa') {
    return 'Kualitas tinggi, resolusi 8k, fotografi iklan komersial, pencahayaan studio dramatis, warna-warna kaya dan mendalam, kesan premium dan mewah, tata letak modern dan canggih, estetika berani dewasa.';
  }
  return 'Kualitas tinggi, resolusi 8k, fotografi iklan komersial, pencahayaan studio bersih, estetika rapi dan profesional.';
}

export function getEngStylePrompt(style: string) {
  if (style === 'anak') {
    return 'High resolution, 8k, advertising commercial photography, bright and cheerful studio lighting, colorful, playful elements, soft edges, kid-friendly aesthetic, joyful atmosphere.';
  } else if (style === 'dewasa') {
    return 'High resolution, 8k, advertising commercial photography, dramatic studio lighting, deep rich colors, elegant and premium vibe, sleek and sophisticated layout, bold and mature aesthetic.';
  }
  return 'High resolution, 8k, advertising commercial photography, clean studio lighting, highly organized, clean aesthetic.';
}

export function generateIndoPrompt(input: PromptInput): string {
  const brandText = input.brandName ? `dari merek "${input.brandName}"` : '';
  const stylePrompt = getIndoStylePrompt(input.designStyle);
  
  const camObj = CAMERA_ANGLES.find(c => c.value === input.cameraAngle) || CAMERA_ANGLES[0];
  const lightObj = LIGHTINGS.find(l => l.value === input.lighting) || LIGHTINGS[0];

  let arSuffix = `--ar ${input.aspectRatio.replace(':', ':')}`;
  let arText = `Ukuran: Aspect ratio ${input.aspectRatio} (${arSuffix})`;
  if (input.aiPlatform === 'dalle3') {
    arText = `Ukuran: Gunakan format rasio ${input.aspectRatio}`;
  }

  const propsText = input.backgroundProps 
    ? `Dekorasi latar tambahan: dilengkapi dengan dekorasi berupa ${input.backgroundProps} yang diatur secara estetis di sekeliling produk.` 
    : '';

  return `Desain flyer iklan profesional untuk produk "${input.productName}" ${brandText}. Konteks kemasan: ${input.packagingInfo}. 

${arText}. 
Komposisi: 80% visual fotorealistik berkualitas tinggi dan 20% ruang teks kosong (negative space) bersih untuk penempatan promo. 
Layout Utama: Modern grid-based infographic layout (tata letak kotak-panel rapi). 
Bagian Atas: Menampilkan wujud produk utama "${input.productName}" beserta visual kemasannya (${input.packagingInfo}) yang terlihat premium, besar, dan sangat detail. 
Bagian Tengah: Deretan ikon fitur produk, diikuti oleh grid foto-foto kecil yang menunjukkan produk sedang digunakan dalam berbagai skenario sehari-hari secara estetik. 
Bagian Bawah: Panduan visual langkah-langkah 'How to Use' dengan foto dan kotak daftar 'Keunggulan'. 
Footer: Baris footer elegan dengan placeholder untuk kontak. 

Sudut Kamera: ${camObj.labelIndo}.
Pencahayaan: ${lightObj.labelIndo}.
${propsText}

Gaya Visual: ${stylePrompt} ${input.colorTheme ? `Tema palet warna dominan: ${input.colorTheme}.` : ''}`;
}

export function generateEngPrompt(input: PromptInput): string {
  const brandText = input.brandName ? `by the brand "${input.brandName}"` : '';
  const stylePrompt = getEngStylePrompt(input.designStyle);
  
  const camObj = CAMERA_ANGLES.find(c => c.value === input.cameraAngle) || CAMERA_ANGLES[0];
  const lightObj = LIGHTINGS.find(l => l.value === input.lighting) || LIGHTINGS[0];

  let arSuffix = `--ar ${input.aspectRatio.replace(':', ':')}`;
  let arText = `Size: Aspect ratio ${input.aspectRatio} (${arSuffix})`;
  if (input.aiPlatform === 'dalle3') {
    arText = `Size: Portrait ratio ${input.aspectRatio}`;
  } else if (input.aiPlatform === 'stable-diffusion') {
    arText = `Size: Resolution matched to ratio ${input.aspectRatio}`;
  }

  const propsText = input.backgroundProps 
    ? `Background elements & props: styled with aesthetic ${input.backgroundProps} scattered artistically around the main product.` 
    : '';

  return `Professional advertising flyer design for "${input.productName}" ${brandText}. Packaging context: ${input.packagingInfo}. 

${arText}. 
Composition: 80% high-quality photorealistic visual elements and 20% negative space for typography. 
Main Layout: Modern grid-based infographic layout (clean, organized panels). 
Top Section: Highlights the primary product "${input.productName}" and its packaging (${input.packagingInfo}) rendered in premium, large-scale, highly detailed closeups. 
Middle Section: Row of sleek product feature icons, accompanied by a clean grid of lifestyle action shots showing the product being used in daily scenarios. 
Bottom Section: Step-by-step visual "How to Use" guide with photos and a "Key Benefits" checklist card. 
Footer: Elegant footer banner with minimalist contact placeholders. 

Camera Shot: ${camObj.labelEng}.
Lighting Scheme: ${lightObj.labelEng}.
${propsText}

Visual Style: ${stylePrompt} ${input.colorTheme ? `Color theme: ${input.colorTheme}.` : ''}`;
}
