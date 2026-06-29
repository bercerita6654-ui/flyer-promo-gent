import React from 'react';
import { Layers, Image as ImageIcon, CheckCircle, HelpCircle, Eye, Sliders, LayoutGrid } from 'lucide-react';
import { PromptInput } from '../types';

interface FlyerMockupProps {
  input: PromptInput;
}

export default function FlyerMockup({ input }: FlyerMockupProps) {
  const { 
    brandName, 
    productName, 
    packagingInfo, 
    designStyle, 
    aspectRatio, 
    colorTheme, 
    previewTheme,
    cameraAngle,
    lighting,
    backgroundProps
  } = input;

  // Compute aspect ratio classes for the mockup container
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square max-w-[280px] sm:max-w-[320px]';
      case '16:9':
        return 'aspect-[16/9] max-w-[420px]';
      case '9:16':
        return 'aspect-[9/16] max-w-[210px] sm:max-w-[240px]';
      case '4:5':
      default:
        return 'aspect-[4/5] max-w-[280px] sm:max-w-[320px]';
    }
  };

  // Determine styles depending on the selected interactive preview theme
  const getStyleTheme = () => {
    const selectedTheme = previewTheme || (designStyle === 'anak' ? 'sweet-pastel' : designStyle === 'dewasa' ? 'royal-luxury' : 'minimal-slate');
    
    switch (selectedTheme) {
      case 'warm-espresso':
        return {
          bg: 'bg-gradient-to-b from-amber-950 via-[#27150a] to-[#0f0703] text-amber-100',
          cardBg: 'bg-[#1a0f0a]/80 border-amber-900/40 backdrop-blur-md shadow-lg',
          accent: 'bg-amber-500 text-black font-semibold',
          secondaryAccent: 'bg-[#2d1b12] border border-amber-900/30 text-amber-300',
          badgeText: 'text-amber-400 font-bold',
          titleFont: 'font-display font-bold tracking-tight text-amber-200',
          themeLabel: 'Warm Espresso ☕',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none'
        };
      case 'forest-natural':
        return {
          bg: 'bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-emerald-100',
          cardBg: 'bg-emerald-950/40 border-emerald-900/30 backdrop-blur-md shadow-md',
          accent: 'bg-emerald-500 text-emerald-950 font-semibold',
          secondaryAccent: 'bg-teal-900/50 border border-emerald-900/20 text-emerald-300',
          badgeText: 'text-emerald-400 font-bold',
          titleFont: 'font-display font-bold tracking-tight text-emerald-200',
          themeLabel: 'Forest Natural 🌿',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none'
        };
      case 'sweet-pastel':
        return {
          bg: 'bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 text-purple-950',
          cardBg: 'bg-white/80 border-purple-200/50 shadow-md',
          accent: 'bg-purple-600 text-white font-semibold',
          secondaryAccent: 'bg-pink-100 border border-pink-200 text-pink-700',
          badgeText: 'text-purple-600 font-bold',
          titleFont: 'font-display font-bold tracking-tight text-purple-900',
          themeLabel: 'Sweet Pastel 🎈',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none'
        };
      case 'royal-luxury':
        return {
          bg: 'bg-gradient-to-b from-purple-950 via-slate-950 to-indigo-950 text-indigo-100',
          cardBg: 'bg-indigo-950/50 border-purple-900/40 backdrop-blur-md shadow-xl',
          accent: 'bg-amber-400 text-purple-950 font-bold',
          secondaryAccent: 'bg-slate-900 border border-indigo-500/20 text-amber-300',
          badgeText: 'text-amber-300 font-bold',
          titleFont: 'font-display font-bold tracking-wide text-amber-200',
          themeLabel: 'Royal Luxury 👑',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none'
        };
      case 'cyber-neon':
        return {
          bg: 'bg-gradient-to-b from-fuchsia-950 via-violet-950 to-slate-950 text-fuchsia-100',
          cardBg: 'bg-black/60 border-fuchsia-500/30 backdrop-blur-md shadow-neon',
          accent: 'bg-fuchsia-500 text-black font-bold shadow-lg shadow-fuchsia-500/20',
          secondaryAccent: 'bg-violet-950 border border-fuchsia-500/20 text-cyan-400',
          badgeText: 'text-cyan-400 font-bold',
          titleFont: 'font-mono font-bold tracking-tight text-fuchsia-300',
          themeLabel: 'Cyber Neon ⚡',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none'
        };
      case 'minimal-slate':
      default:
        return {
          bg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100',
          cardBg: 'bg-slate-900/60 border-slate-800 backdrop-blur-md shadow-lg',
          accent: 'bg-indigo-600 text-white font-semibold',
          secondaryAccent: 'bg-slate-950 border border-slate-800 text-indigo-400',
          badgeText: 'text-indigo-400 font-bold',
          titleFont: 'font-sans font-bold tracking-tight text-slate-100',
          themeLabel: 'Minimal Slate 💼',
          ambientLight: 'absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none'
        };
    }
  };

  const theme = getStyleTheme();

  const getCameraLabel = () => {
    switch (cameraAngle) {
      case 'flatlay': return 'Flatlay View 📐';
      case 'macro-detail': return 'Macro Close-Up 🔍';
      case 'dynamic-low': return 'Low-Angle Heroic ⚡';
      case 'studio-portrait':
      default:
        return 'Studio Portrait 📸';
    }
  };

  const getLightingLabel = () => {
    switch (lighting) {
      case 'warm-chiaroscuro': return 'Chiaroscuro 🌅';
      case 'natural-sunlight': return 'Natural Sunlight 🌿';
      case 'cinematic-glow': return 'Cinematic Glow ✨';
      case 'softbox-studio':
      default:
        return 'Softbox Studio 💡';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl backdrop-blur-md relative overflow-hidden group shadow-xl" id="flyer-mockup-wrapper">
      
      {/* Dynamic Background Aura */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between w-full mb-4 z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
          </span>
          <div>
            <h4 className="text-xs font-display font-semibold text-slate-200">
              Pratinjau Layout Visual Flyer
            </h4>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
              GRID RASIO: {aspectRatio}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-mono text-slate-400">
            {getCameraLabel()}
          </span>
          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-mono text-slate-400">
            {getLightingLabel()}
          </span>
        </div>
      </div>

      {/* Actual Mockup Canvas */}
      <div
        className={`w-full relative shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 border border-white/5 ${getAspectRatioClass()} ${theme.bg}`}
        id="flyer-live-canvas"
      >
        {/* Soft background glow effect simulation */}
        {theme.ambientLight}

        {/* Studio Lighting glare layer simulation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

        {/* Visual / Text Split Overlay Label */}
        <div className="absolute top-2.5 left-2.5 z-20 flex gap-1.5">
          <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-mono text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            80% Area Visual
          </span>
          <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-mono text-indigo-400 font-semibold border border-indigo-500/20">
            20% Ruang Teks
          </span>
        </div>

        {/* Outer Frame Content Layout Container */}
        <div className="absolute inset-0 flex flex-col p-4 sm:p-5 justify-between h-full z-10">
          
          {/* TOP SECTION: Focal product view (approx 45% height) */}
          <div className="h-[45%] flex flex-col justify-between" id="mockup-top-section">
            <div className="flex items-center justify-between">
              <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md ${theme.accent}`}>
                {brandName ? brandName : 'Merek Anda'}
              </span>
              <span className="text-[7px] font-mono opacity-60 tracking-wider">PREMIUM SERIES</span>
            </div>

            {/* Central product hero placement */}
            <div className="flex-1 flex flex-col items-center justify-center mt-2 relative">
              {/* Product Container Representation */}
              <div className="absolute inset-0 bg-white/5 rounded-xl flex items-center justify-center pointer-events-none border border-dashed border-white/10 group-hover:bg-white/10 transition-colors">
                <ImageIcon className="w-10 h-10 opacity-10 animate-pulse text-indigo-300" />
              </div>
              
              {/* Dynamic text outputs */}
              <p className={`text-center text-xs sm:text-sm ${theme.titleFont} line-clamp-2 px-2 z-10 drop-shadow-md leading-snug`}>
                {productName ? productName : 'Nama Produk Unggulan Anda'}
              </p>
              
              <span className="text-[8px] sm:text-[9px] opacity-90 mt-1.5 z-10 max-w-full text-center px-2.5 py-0.5 rounded-full bg-black/30 border border-white/10 font-mono font-medium tracking-tight">
                📦 {packagingInfo ? packagingInfo : 'Detail Botol, Box, kemasan...'}
              </span>
            </div>
          </div>

          {/* MIDDLE SECTION: Feature panels and lifestyle grids (approx 25% height) */}
          <div className={`h-[25%] my-2 rounded-xl border p-2 flex flex-col justify-between ${theme.cardBg}`} id="mockup-middle-section">
            <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
              <span className="text-[7px] sm:text-[8px] font-mono uppercase opacity-75 tracking-wider">Aktivitas & Skenario</span>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current opacity-60 animate-bounce"></span>
                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
              </div>
            </div>
            
            {/* Grid represent features */}
            <div className="grid grid-cols-3 gap-1 flex-1">
              <div className="bg-black/20 rounded-lg flex flex-col items-center justify-center p-1 border border-white/5 hover:bg-black/30 transition-all">
                <span className="text-[6px] sm:text-[7px] font-mono text-center truncate w-full font-bold">100% Organik</span>
                <span className="text-[5px] opacity-60 text-center scale-90 mt-0.5">Kualitas Terjamin</span>
              </div>
              <div className="bg-black/20 rounded-lg flex flex-col items-center justify-center p-1 border border-white/5 hover:bg-black/30 transition-all">
                <span className="text-[6px] sm:text-[7px] font-mono text-center truncate w-full font-bold">Instan & Praktis</span>
                <span className="text-[5px] opacity-60 text-center scale-90 mt-0.5">Siap Dikonsumsi</span>
              </div>
              <div className="bg-black/20 rounded-lg flex flex-col items-center justify-center p-1 border border-white/5 hover:bg-black/30 transition-all">
                <span className="text-[6px] sm:text-[7px] font-mono text-center truncate w-full font-bold">Higienis</span>
                <span className="text-[5px] opacity-60 text-center scale-90 mt-0.5">Proses Steril</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Practical instructions / key benefits (approx 20% height) */}
          <div className="h-[22%] flex gap-2 items-stretch" id="mockup-bottom-section">
            <div className={`flex-1 rounded-xl p-2 flex flex-col justify-between border ${theme.cardBg}`}>
              <span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-wider opacity-85">Cara Penggunaan</span>
              <div className="flex gap-1.5 mt-1">
                <span className="w-3.5 h-3.5 rounded bg-current/15 flex items-center justify-center text-[7px] font-bold">1</span>
                <span className="w-3.5 h-3.5 rounded bg-current/15 flex items-center justify-center text-[7px] font-bold">2</span>
                <span className="w-3.5 h-3.5 rounded bg-current/15 flex items-center justify-center text-[7px] font-bold">3</span>
              </div>
            </div>
            
            <div className={`flex-1 rounded-xl p-2 flex flex-col justify-between border ${theme.cardBg}`}>
              <span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-wider opacity-85">Keunggulan Utama</span>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[5px] sm:text-[6px] flex items-center gap-1 opacity-90">
                  <CheckCircle className="w-2 h-2 text-emerald-500 flex-shrink-0" /> Tersertifikasi Halal
                </span>
                <span className="text-[5px] sm:text-[6px] flex items-center gap-1 opacity-90">
                  <CheckCircle className="w-2 h-2 text-emerald-500 flex-shrink-0" /> Uji Lab Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER: Bottom 8% text area representing contact panels */}
          <div className="h-[8%] border-t border-white/10 pt-1.5 flex items-center justify-between text-[6px] sm:text-[7px]" id="mockup-footer">
            <span className="opacity-80">Hubungi Kami: @{brandName ? brandName.toLowerCase().replace(/\s+/g, '') : 'merek_anda'}</span>
            <span className="font-mono tracking-tighter uppercase">WWW.{brandName ? brandName.toUpperCase().replace(/\s+/g, '') : 'MEREK'}.COM</span>
          </div>
        </div>
      </div>

      {/* Interactive visualizer theme status tags */}
      <div className="mt-4 text-center w-full z-10 font-sans">
        <span className="text-xs text-slate-300 font-medium block">
          Tema Pratinjau: <span className="text-amber-400">{theme.themeLabel}</span>
        </span>
        {colorTheme && (
          <p className="text-[10px] text-slate-400 bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-full mt-2 inline-block">
            Palet: <span className="text-indigo-300 font-medium">{colorTheme}</span>
          </p>
        )}
        {backgroundProps && (
          <p className="text-[9px] text-slate-500 italic block mt-1.5 truncate max-w-full px-2">
            Aksen: "{backgroundProps}"
          </p>
        )}
      </div>
    </div>
  );
}
