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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden" id="presets-container">
      {/* Decorative top header accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-450 via-orange-400 to-amber-500/80" />
      
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex items-center justify-center p-2 bg-amber-50 border border-amber-200 rounded-xl">
          <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
        </span>
        <h3 className="text-base font-display font-bold text-slate-800">
          Template Inspirasi Produk Cepat
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-5 font-sans leading-relaxed">
        Pilih salah satu template siap pakai di bawah untuk memuat skenario produk dengan parameter visual lengkap secara instan.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="presets-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelectPreset(preset)}
            className="flex flex-col items-start p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-300 rounded-2xl transition-all duration-300 text-left group hover:shadow-sm"
            id={`preset-btn-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2.5 mb-2 w-full">
              <span className="p-2 bg-white border border-slate-200 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                {getIcon(preset.icon)}
              </span>
              <span className="font-sans font-bold text-slate-700 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors truncate">
                {preset.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
