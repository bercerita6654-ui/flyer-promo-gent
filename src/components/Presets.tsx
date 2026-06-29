import React from 'react';
import { Sparkles, Flame, Coffee, Trees, Smile } from 'lucide-react';
import { Preset } from '../types';

interface PresetsProps {
  onSelectPreset: (preset: Preset) => void;
}

export const PRESETS: Preset[] = [
  {
    name: 'Kopi Susu Gula Aren',
    icon: 'coffee',
    brandName: 'Senja Brew',
    productName: 'Kopi Susu Gula Aren Klasik',
    packagingInfo: 'Botol PET 250ml dingin berkabut embun segar',
    designStyle: 'dewasa',
    colorTheme: 'Cokelat Hangat, Caramel & Emas',
    description: 'Tampilan premium bertema senja elegan untuk pecinta kopi modern.',
    cameraAngle: 'studio-portrait',
    lighting: 'warm-chiaroscuro',
    backgroundProps: 'remah gula aren bubuk dan biji kopi berserakan artistik',
    previewTheme: 'warm-espresso',
  },
  {
    name: 'Sabun Mandi Lavender',
    icon: 'trees',
    brandName: 'Botanika',
    productName: 'Sabun Mandi Organik Lavender & Chamomile',
    packagingInfo: 'Kotak kertas daur ulang (recycled paper box) serat alami',
    designStyle: 'umum',
    colorTheme: 'Lavender Lembut, Lilac & Hijau Sage',
    description: 'Estetika bersih, ramah lingkungan, natural, dan menenangkan.',
    cameraAngle: 'flatlay',
    lighting: 'natural-sunlight',
    backgroundProps: 'kelopak bunga lavender segar berserakan dan bayangan jendela daun',
    previewTheme: 'forest-natural',
  },
  {
    name: 'Sereal Cokelat Ceria',
    icon: 'face-smile',
    brandName: 'ChocoFun',
    productName: 'Sereal Jagung Panggang Rasa Cokelat Madu',
    packagingInfo: 'Kotak karton 200g dengan gambar maskot dinosaurus lucu',
    designStyle: 'anak',
    colorTheme: 'Kuning Terang, Oranye & Biru Muda Ceria',
    description: 'Desain penuh warna, playful, ramah anak, dan mengundang selera.',
    cameraAngle: 'dynamic-low',
    lighting: 'softbox-studio',
    backgroundProps: 'cipratan susu segar putih dan remah sereal melayang',
    previewTheme: 'sweet-pastel',
  },
  {
    name: 'Serum Niacinamide Glow',
    icon: 'sparkles',
    brandName: 'Lumiere',
    productName: 'Serum Wajah Hydrating Niacinamide 10% + Zinc 1%',
    packagingInfo: 'Botol kaca frosted 30ml dengan dropper pipet putih minimalist',
    designStyle: 'dewasa',
    colorTheme: 'Frosted Teal, Pearl Putih & Holographic',
    description: 'Gaya kemewahan minimalis, modern, bersih, dan berkesan sains klinis.',
    cameraAngle: 'macro-detail',
    lighting: 'cinematic-glow',
    backgroundProps: 'riak air jernih memantulkan cahaya holografis dan podium minimalis',
    previewTheme: 'royal-luxury',
  }
];

export default function Presets({ onSelectPreset }: PresetsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'trees':
        return <Trees className="w-4 h-4 text-emerald-500" />;
      case 'face-smile':
        return <Smile className="w-4 h-4 text-yellow-500" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl" id="presets-container">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center p-1.5 bg-amber-500/15 border border-amber-500/20 rounded-lg">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
        </span>
        <h3 className="text-md font-display font-bold text-slate-200">
          Template Inspirasi Produk Cepat
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
        Pilih salah satu template siap pakai di bawah untuk memuat skenario produk dengan parameter visual lengkap secara instan.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="presets-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset)}
            className="flex flex-col items-start p-3.5 bg-slate-950/50 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-700/60 rounded-xl transition-all duration-200 text-left group"
            id={`preset-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <span className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                {getIcon(preset.icon)}
              </span>
              <span className="font-sans font-semibold text-slate-200 text-xs sm:text-sm group-hover:text-amber-300 transition-colors truncate">
                {preset.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
