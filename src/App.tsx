import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  Layout, 
  ExternalLink, 
  FileText, 
  Globe, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Palette, 
  HelpCircle,
  Package,
  Compass,
  Download,
  Flame,
  ArrowRight,
  Sparkle,
  Camera,
  Sun,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignStyle, AspectRatio, AIPlatform, PromptInput, SavedPrompt, Preset } from './types';
import { generateIndoPrompt, generateEngPrompt, CAMERA_ANGLES, LIGHTINGS } from './utils';
import Presets from './components/Presets';
import FlyerMockup from './components/FlyerMockup';
import PromptHistory from './components/PromptHistory';
import Toast from './components/Toast';
import { useSystemTheme } from './hooks/useSystemTheme';
import ProductSearchInput from './components/ProductSearchInput';

export default function App() {
  const systemTheme = useSystemTheme();

  // 1. Core Input State
  const [input, setInput] = useState<PromptInput>({
    brandName: '',
    productName: '',
    packagingInfo: '',
    designStyle: 'umum',
    aspectRatio: '4:5',
    aiPlatform: 'midjourney',
    includeNegativeSpace: true,
    colorTheme: '',
    cameraAngle: 'studio-portrait',
    lighting: 'softbox-studio',
    backgroundProps: '',
    previewTheme: 'minimal-slate',
  });

  const [promptIndo, setPromptIndo] = useState<string>('');
  const [promptEng, setPromptEng] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<'indo' | 'eng'>('eng'); // English is best for image generators
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true); // Kept visible for rich options
  const [history, setHistory] = useState<SavedPrompt[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // AI Enhancer States
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhanceProgressText, setEnhanceProgressText] = useState<string>('');
  const [isAiEnhanced, setIsAiEnhanced] = useState<boolean>(false);

  // 2. Load History from Local Storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('flyer_prompt_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load prompt history', e);
    }
  }, []);

  // Sync previewTheme with systemTheme preference (minimal-slate for dark, sweet-pastel for light)
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      previewTheme: systemTheme === 'dark' ? 'minimal-slate' : 'sweet-pastel',
    }));
  }, [systemTheme]);

  // 3. Real-time background prompt generation (offline mode)
  useEffect(() => {
    if (input.productName && input.packagingInfo && !isAiEnhanced) {
      const pIndo = generateIndoPrompt(input);
      const pEng = generateEngPrompt(input);
      setPromptIndo(pIndo);
      setPromptEng(pEng);
    }
  }, [input, isAiEnhanced]);

  // Whenever product name or packaging changes, reset AI enhanced flag so offline can update, unless it's empty
  useEffect(() => {
    setIsAiEnhanced(false);
  }, [input.productName, input.packagingInfo, input.brandName, input.cameraAngle, input.lighting, input.backgroundProps, input.colorTheme]);

  // 4. Handle Actions
  const showToastMsg = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleInputChange = (field: keyof PromptInput, value: any) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectPreset = (preset: Preset) => {
    setInput((prev) => ({
      ...prev,
      brandName: preset.brandName,
      productName: preset.productName,
      packagingInfo: preset.packagingInfo,
      designStyle: preset.designStyle,
      colorTheme: preset.colorTheme,
      cameraAngle: preset.cameraAngle,
      lighting: preset.lighting,
      backgroundProps: preset.backgroundProps,
      previewTheme: preset.previewTheme,
    }));
    setIsAiEnhanced(false);
    setShowResult(true);
    showToastMsg(`Template "${preset.name}" berhasil dimuat!`, 'success');
  };

  const handleOfflineGenerate = () => {
    if (!input.productName.trim() || !input.packagingInfo.trim()) {
      showToastMsg('Mohon isi Nama Produk dan Detail Kemasan terlebih dahulu.', 'error');
      return;
    }

    const pIndo = generateIndoPrompt(input);
    const pEng = generateEngPrompt(input);
    
    setPromptIndo(pIndo);
    setPromptEng(pEng);
    setIsAiEnhanced(false);
    setShowResult(true);

    // Save to history
    const newSaved: SavedPrompt = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input: { ...input },
      promptIndo: pIndo,
      promptEng: pEng,
      isAiEnhanced: false
    };

    const updatedHistory = [newSaved, ...history.slice(0, 19)];
    setHistory(updatedHistory);
    localStorage.setItem('flyer_prompt_history', JSON.stringify(updatedHistory));

    showToastMsg('Prompt standar berhasil dibuat! ✨', 'success');
  };

  // AI MAGIC ENHANCER (Express Server + Gemini integration)
  const handleAiEnhance = async () => {
    if (!input.productName.trim() || !input.packagingInfo.trim()) {
      showToastMsg('Mohon isi Nama Produk dan Detail Kemasan terlebih dahulu.', 'error');
      return;
    }

    setIsEnhancing(true);
    setEnhanceProgressText('Menganalisis karakteristik produk... 🔍');

    const progressPhases = [
      'Menghitung proporsi visual flyer (80% / 20%)... 📐',
      'Merancang skenario studio foto komersial profesional... 📸',
      'Mengatur pencahayaan 3-point studio softbox... 💡',
      'Menerjemahkan tekstur material fisik dan kelembaban... ✨',
      'Menyusun prompt siap copy dalam Bahasa Inggris... 🇺🇸',
      'Membuat padanan salinan Bahasa Indonesia yang terstruktur... 🇮🇩'
    ];

    let phaseIdx = 0;
    const interval = setInterval(() => {
      if (phaseIdx < progressPhases.length) {
        setEnhanceProgressText(progressPhases[phaseIdx]);
        phaseIdx++;
      }
    }, 1200);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Terjadi kesalahan pada server.');
      }

      const data = await response.json();
      clearInterval(interval);

      if (data.promptEng && data.promptIndo) {
        setPromptEng(data.promptEng);
        setPromptIndo(data.promptIndo);
        setIsAiEnhanced(true);
        setShowResult(true);

        // Save to history
        const newSaved: SavedPrompt = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          input: { ...input },
          promptIndo: data.promptIndo,
          promptEng: data.promptEng,
          isAiEnhanced: true
        };

        const updatedHistory = [newSaved, ...history.slice(0, 19)];
        setHistory(updatedHistory);
        localStorage.setItem('flyer_prompt_history', JSON.stringify(updatedHistory));

        showToastMsg('Prompt berhasil dioptimasi dengan Gemini AI! 🪄', 'success');
      } else {
        throw new Error('Server mengembalikan format prompt kosong.');
      }

    } catch (error: any) {
      clearInterval(interval);
      console.error(error);
      showToastMsg(error.message || 'Gagal terhubung dengan server AI.', 'error');
    } finally {
      setIsEnhancing(false);
      setEnhanceProgressText('');
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToastMsg('Prompt disalin ke clipboard! Siap digunakan.', 'success');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToastMsg('Prompt disalin ke clipboard! (Fallback)', 'success');
      } catch (fallbackErr) {
        showToastMsg('Gagal menyalin otomatis. Silakan salin secara manual.', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('flyer_prompt_history', JSON.stringify(updated));
    showToastMsg('Riwayat prompt berhasil dihapus.', 'info');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('flyer_prompt_history');
    showToastMsg('Semua riwayat berhasil dibersihkan.', 'info');
  };

  const handleReset = () => {
    setInput({
      brandName: '',
      productName: '',
      packagingInfo: '',
      designStyle: 'umum',
      aspectRatio: '4:5',
      aiPlatform: 'midjourney',
      includeNegativeSpace: true,
      colorTheme: '',
      cameraAngle: 'studio-portrait',
      lighting: 'softbox-studio',
      backgroundProps: '',
      previewTheme: 'minimal-slate',
    });
    setPromptIndo('');
    setPromptEng('');
    setIsAiEnhanced(false);
    setShowResult(false);
    showToastMsg('Formulir berhasil dibersihkan.', 'info');
  };

  const handleDownloadTxt = () => {
    const activeText = activeLang === 'eng' ? promptEng : promptIndo;
    const element = document.createElement('a');
    const file = new Blob([
      `=== FLYER ADVERTISING PROMPT ===\n`,
      `Target AI Platform: ${input.aiPlatform.toUpperCase()}\n`,
      `Aspect Ratio: ${input.aspectRatio}\n`,
      `Product: ${input.productName}\n`,
      `Brand: ${input.brandName || '-'}\n`,
      `Style: ${input.designStyle}\n`,
      `AI Optimized: ${isAiEnhanced ? 'YES (Gemini AI Enhanced)' : 'NO'}\n\n`,
      `--- PROMPT ENGLISH ---\n`,
      `${promptEng}\n\n`,
      `--- PROMPT INDONESIA ---\n`,
      `${promptIndo}\n`
    ], { type: 'text/plain;charset=utf-8' });
    
    element.href = URL.createObjectURL(file);
    element.download = `Flyer_Prompt_${input.productName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToastMsg('File prompt .txt berhasil diunduh! 💾', 'success');
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" id="main-app-container">
      {/* Toast Alert Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Futuristic backdrop mesh glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Header Navigation */}
      <header className="border-b border-slate-900 bg-[#070913]/90 backdrop-blur-lg sticky top-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-xl shadow-indigo-500/20 relative group overflow-hidden" id="header-logo">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">
                Flyer Prompt Generator AI
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Rancang prompt visual iklan produk 8K fotorealistik untuk Midjourney, DALL-E & Stable Diffusion
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[11px] font-mono text-indigo-400 font-semibold shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>GEMINI 3.5 INTEL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content">
        
        {/* TOP COMPONENT: Preset Templates Selection */}
        <section id="presets-section">
          <Presets onSelectPreset={handleSelectPreset} />
        </section>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="app-grid-layout">
          
          {/* LEFT SIDEBAR: Comprehensive Parameters Builder (7 cols) */}
          <section className="lg:col-span-7 bg-[#0b0f19]/80 border border-slate-900 rounded-3xl p-6 shadow-2xl relative" id="left-form-panel">
            
            {/* Glossy top border line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-fuchsia-500/50" />

            <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-md sm:text-lg font-display font-bold text-slate-100">
                    Konfigurator Detail Flyer
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">Atur spesifikasi visual produk dan konsep iklan Anda</p>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-sans font-medium px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all shadow-inner"
                id="reset-form-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Form
              </button>
            </div>

            <div className="space-y-5 font-sans">
              
              {/* BRAND INPUT & PRODUCT INPUT ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4 form-group" id="brand-input-group">
                  <label htmlFor="brandName" className="block text-xs font-semibold text-slate-300 mb-2 tracking-wider uppercase">
                    Nama Merek / Brand
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    value={input.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="Contoh: Senja Brew..."
                    className="w-full px-4 py-3 bg-[#06080e] border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-700 text-sm transition-all outline-none shadow-inner"
                  />
                </div>

                <div className="sm:col-span-8 form-group" id="product-input-group">
                  <label htmlFor="productName" className="block text-xs font-semibold text-slate-300 mb-2 tracking-wider uppercase">
                    Nama / Jenis Produk <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <ProductSearchInput
                    value={input.productName}
                    onChange={(val) => handleInputChange('productName', val)}
                    onSelectProduct={(prod, brand) => {
                      setInput((prev) => ({
                        ...prev,
                        productName: prod,
                        brandName: brand || prev.brandName,
                      }));
                    }}
                  />
                </div>
              </div>

              {/* PACKAGING DETAIL */}
              <div className="form-group" id="packaging-input-group">
                <label htmlFor="packagingInfo" className="block text-xs font-semibold text-slate-300 mb-2 tracking-wider uppercase">
                  Deskripsi / Kemasan Produk <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  id="packagingInfo"
                  value={input.packagingInfo}
                  onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                  placeholder="Contoh: Botol PET 250ml dingin berkabut embun, Box kertas serat daur ulang..."
                  className="w-full px-4 py-3 bg-[#06080e] border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-700 text-sm transition-all outline-none shadow-inner"
                  required
                />
              </div>

              {/* AUDIENCE / STYLE SELECTOR */}
              <div className="form-group" id="style-input-group">
                <label className="block text-xs font-semibold text-slate-300 mb-2.5 tracking-wider uppercase">
                  Gaya Desain & Target Audiens
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['umum', 'anak', 'dewasa'] as DesignStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleInputChange('designStyle', style)}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold tracking-tight transition-all flex flex-col items-center justify-center gap-1.5 ${
                        input.designStyle === style
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-550/10'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                      }`}
                      id={`style-btn-${style}`}
                    >
                      {style === 'umum' && (
                        <>
                          <span className="text-base">💼</span>
                          <span>Umum / Netral</span>
                        </>
                      )}
                      {style === 'anak' && (
                        <>
                          <span className="text-base">🎈</span>
                          <span>Anak-Anak / Ceria</span>
                        </>
                      )}
                      {style === 'dewasa' && (
                        <>
                          <span className="text-base">👑</span>
                          <span>Dewasa / Premium</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLLAPSIBLE ADVANCED DESIGN CONTROLS */}
              <div className="pt-4 border-t border-slate-900" id="advanced-settings-accordion">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Parameter Estetika Fotografi Studio
                  </h3>
                </div>

                <div className="space-y-4" id="advanced-settings-content">
                  
                  {/* Camera Angle & Studio Lighting Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cameraAngle" className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-400" />
                        Sudut Kamera (Shot Angle)
                      </label>
                      <select
                        id="cameraAngle"
                        value={input.cameraAngle}
                        onChange={(e) => handleInputChange('cameraAngle', e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#06080e] border border-slate-855 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      >
                        {CAMERA_ANGLES.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="lighting" className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-indigo-400" />
                        Pencahayaan (Lighting)
                      </label>
                      <select
                        id="lighting"
                        value={input.lighting}
                        onChange={(e) => handleInputChange('lighting', e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#06080e] border border-slate-855 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      >
                        {LIGHTINGS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CUSTOM BACKGROUND DECORATIONS */}
                  <div>
                    <label htmlFor="backgroundProps" className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      Dekorasi & Ornamen Latar Belakang (Props)
                    </label>
                    <input
                      type="text"
                      id="backgroundProps"
                      value={input.backgroundProps}
                      onChange={(e) => handleInputChange('backgroundProps', e.target.value)}
                      placeholder="Contoh: kelopak bunga lavender segar, cipratan air jernih berkilau, bayangan jendela dedaunan..."
                      className="w-full px-4 py-3 bg-[#06080e] border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-700 text-xs transition-all outline-none shadow-inner"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed italic">
                      Tips: Sebutkan objek organik penunjang produk (misal: "potongan buah apel segar", "butiran cokelat melayang") untuk menghidupkan suasana foto.
                    </span>
                  </div>

                  {/* PALETTE & PREVIEW THEMES & RATIO */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    
                    {/* Custom Color Theme */}
                    <div>
                      <label htmlFor="colorTheme" className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-indigo-455" />
                        Palet Warna
                      </label>
                      <input
                        type="text"
                        id="colorTheme"
                        value={input.colorTheme}
                        onChange={(e) => handleInputChange('colorTheme', e.target.value)}
                        placeholder="Contoh: Emas & Teal, Pastel, Sage Green..."
                        className="w-full px-3 py-2 bg-[#06080e] border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-700 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label htmlFor="aspectRatio" className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                        <Grid className="w-3.5 h-3.5 text-indigo-455" />
                        Rasio Flyer
                      </label>
                      <select
                        id="aspectRatio"
                        value={input.aspectRatio}
                        onChange={(e) => handleInputChange('aspectRatio', e.target.value as AspectRatio)}
                        className="w-full px-3 py-2 bg-[#06080e] border border-slate-850 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="4:5">Portrait 4:5 (Sosmed Flyer)</option>
                        <option value="1:1">Square 1:1 (Instagram Feed)</option>
                        <option value="9:16">Stories 9:16 (Stories / TikTok)</option>
                        <option value="16:9">Landscape 16:9 (Banner Iklan)</option>
                      </select>
                    </div>

                    {/* Interactive Preview Canvas Theme */}
                    <div>
                      <label htmlFor="previewTheme" className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                          Gaya Mockup
                        </span>
                        <span className="text-[9px] text-indigo-400 font-semibold font-mono tracking-wider flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${systemTheme === 'dark' ? 'bg-indigo-400' : 'bg-fuchsia-400'}`} />
                          {systemTheme === 'dark' ? 'SYS DARK 🌙' : 'SYS LIGHT ☀️'}
                        </span>
                      </label>
                      <select
                        id="previewTheme"
                        value={input.previewTheme}
                        onChange={(e) => handleInputChange('previewTheme', e.target.value)}
                        className="w-full px-3 py-2 bg-[#06080e] border border-slate-850 rounded-xl text-xs text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="minimal-slate">Cool Minimal Slate 💼</option>
                        <option value="warm-espresso">Warm Espresso ☕</option>
                        <option value="forest-natural">Forest Natural 🌿</option>
                        <option value="sweet-pastel">Sweet Pastel 🎈</option>
                        <option value="royal-luxury">Royal Luxury 👑</option>
                        <option value="cyber-neon">Cyber Neon ⚡</option>
                      </select>
                    </div>

                  </div>

                  {/* AI target engine */}
                  <div className="form-group pt-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                      Target Pembuat Gambar AI
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['midjourney', 'dalle3', 'stable-diffusion'] as AIPlatform[]).map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => handleInputChange('aiPlatform', platform)}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-mono uppercase font-bold transition-all ${
                            input.aiPlatform === platform
                              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                              : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-850 hover:text-slate-300'
                          }`}
                          id={`platform-btn-${platform}`}
                        >
                          {platform === 'midjourney' && 'Midjourney v6'}
                          {platform === 'dalle3' && 'DALL-E 3'}
                          {platform === 'stable-diffusion' && 'Stable Diff.'}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION CALL ROW: Traditional Generation & Dual Gemini AI Magic Enhance */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-4">
                
                {/* Traditional Direct Generator Button */}
                <button
                  type="button"
                  onClick={handleOfflineGenerate}
                  disabled={isEnhancing}
                  className="sm:col-span-5 py-3.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-sans font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  id="generate-standard-btn"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Hasilkan Prompt Standar
                </button>

                {/* AI MAGIC GLOWING ENHANCER BUTTON */}
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isEnhancing}
                  className="sm:col-span-7 py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-fuchsia-600 hover:from-indigo-600 hover:via-purple-700 hover:to-fuchsia-700 text-white font-sans font-bold rounded-xl text-xs transition-all relative overflow-hidden flex items-center justify-center gap-2 group shadow-xl shadow-indigo-950/30 active:scale-[0.98] disabled:opacity-50"
                  id="generate-ai-magic-btn"
                >
                  {isEnhancing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Gemini Memformulasikan...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
                      <span>Optimasi dengan Gemini AI 🪄</span>
                      {/* Glow effect on hover */}
                      <span className="absolute right-0 top-0 bottom-0 w-12 bg-white/10 skew-x-12 translate-x-12 group-hover:-translate-x-96 transition-transform duration-1000 ease-out" />
                    </>
                  )}
                </button>

              </div>

              {/* Loading progress detailed state */}
              <AnimatePresence>
                {isEnhancing && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl flex items-center gap-3 text-xs text-indigo-300 font-sans"
                    id="ai-loading-progress-panel"
                  >
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </div>
                    <span className="animate-pulse">{enhanceProgressText}</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </section>

          {/* RIGHT SIDEBAR: Visual Live Canvas Preview & Dynamic Generated Copy Boxes */}
          <section className="lg:col-span-5 space-y-6" id="right-preview-panel">
            
            {/* Live Interactive Visualization Card */}
            <FlyerMockup input={input} />

            {/* Prompt Results Interface Container */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="bg-[#0b0f19] border border-indigo-950/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden"
                  id="results-container"
                >
                  {/* Glowing header strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
                  
                  <div className="flex items-center justify-between mb-4 z-10 relative">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-display font-bold text-slate-200">
                        Hasil Formula Prompt AI
                      </h3>
                      {isAiEnhanced && (
                        <span className="text-[9px] font-mono bg-fuchsia-500/10 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/20 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <Sparkle className="w-2.5 h-2.5 fill-current" />
                          Gemini AI
                        </span>
                      )}
                    </div>
                    
                    {/* Dynamic Language Toggle */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shadow-inner">
                      <button
                        onClick={() => {
                          setActiveLang('eng');
                          showToastMsg('Menampilkan Prompt Bahasa Inggris (Sangat disarankan).', 'info');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-all ${
                          activeLang === 'eng'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        id="lang-eng-btn"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-300" />
                        English
                      </button>
                      <button
                        onClick={() => {
                          setActiveLang('indo');
                          showToastMsg('Menampilkan Prompt Bahasa Indonesia.', 'info');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-all ${
                          activeLang === 'indo'
                            ? 'bg-[#1b2130] text-slate-200 shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        id="lang-indo-btn"
                      >
                        <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
                        Indo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Prompt Box display */}
                    <div className="relative group">
                      <textarea
                        readOnly
                        value={activeLang === 'eng' ? promptEng : promptIndo}
                        className="w-full h-[220px] p-4 bg-slate-950 border border-slate-850 rounded-2xl text-slate-300 placeholder-slate-700 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-0 shadow-inner"
                        id="prompt-result-textarea"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none rounded-2xl" />
                    </div>

                    {/* Integrated Action Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCopy(activeLang === 'eng' ? promptEng : promptIndo)}
                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-sans font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                        id="copy-to-clipboard-btn"
                      >
                        <Copy className="w-4 h-4" />
                        Salin ({activeLang === 'eng' ? 'Inggris' : 'Indo'})
                      </button>

                      <button
                        onClick={handleDownloadTxt}
                        className="py-3 px-4 bg-[#141b2c] hover:bg-[#1a233a] border border-[#212c47] text-slate-300 hover:text-white transition-all font-sans font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        id="download-txt-prompt-btn"
                      >
                        <Download className="w-4 h-4" />
                        Unduh File .TXT
                      </button>
                    </div>

                    {/* Pro Tips with platform access buttons */}
                    <div className="border-t border-slate-900 pt-3 space-y-2.5">
                      <p className="text-[10px] text-slate-500 font-sans text-center leading-relaxed flex items-center justify-center gap-1">
                        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        Prompt Bahasa Inggris sangat direkomendasikan untuk kualitas gambar maksimal.
                      </p>

                      {/* Direct Platform Links */}
                      <div className="flex flex-wrap gap-2 justify-center" id="platform-links-bar">
                        <a 
                          href="https://discord.com/invite/midjourney" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-indigo-950/40 hover:bg-indigo-900/30 border border-indigo-900/30 rounded-lg text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          Discord Midjourney <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a 
                          href="https://www.bing.com/images/create" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-900/30 border border-blue-900/30 rounded-lg text-[9px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Bing Image Creator <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a 
                          href="https://leonardo.ai/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-purple-950/40 hover:bg-purple-900/30 border border-purple-900/30 rounded-lg text-[9px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          Leonardo AI <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </section>
        </div>

        {/* BOTTOM SECTION: Historic logs & interactive visual guides */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="bottom-widgets-layout">
          
          {/* Saved History logs (7 cols) */}
          <div className="lg:col-span-7">
            <PromptHistory
              history={history}
              onCopyPrompt={handleCopy}
              onDeletePrompt={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          </div>

          {/* Quick AI Pro-Tips Manual (5 cols) */}
          <div className="lg:col-span-5 bg-[#0b0f19]/60 border border-slate-900 rounded-3xl p-6 backdrop-blur-sm space-y-4" id="ai-pro-tips-card">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                <HelpCircle className="w-4.5 h-4.5" />
              </span>
              <h3 className="text-sm font-display font-bold text-slate-200">
                Panduan & Trik Pembuatan Flyer AI
              </h3>
            </div>
            
            <div className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
              <div className="flex items-start gap-3 border-b border-slate-900 pb-3">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono">1</span>
                <div>
                  <p className="font-bold text-slate-300">Gunakan Magic Enhancer Gemini AI</p>
                  <p className="mt-0.5 text-slate-400 leading-normal">Bila diaktifkan, Gemini menganalisis jenis produk dan merumuskan detail kamera macro, bayangan kristal, pembiasan kaca frosted, dan tata letak secara profesional.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b border-slate-900 pb-3">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono">2</span>
                <div>
                  <p className="font-bold text-slate-300">Rasio Portrait (4:5) Ideal</p>
                  <p className="mt-0.5 text-slate-400 leading-normal">Secara default, parameter <code className="text-indigo-400 font-mono">--ar 4:5</code> ditambahkan di akhir prompt Midjourney untuk menciptakan dimensi vertikal yang seimbang untuk flyer cetak maupun media sosial.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono">3</span>
                <div>
                  <p className="font-bold text-slate-300">Sediakan Ruang Negatif (20%)</p>
                  <p className="mt-0.5 text-slate-400 leading-normal">Prompt kami sengaja diinstruksikan menyisakan ruang kosong (negative space) sebesar 20%. Ini memberikan Anda ruang bersih untuk menambahkan teks penawaran, logo, dan kontak di Canva atau Figma.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding Area */}
      <footer className="border-t border-slate-900 bg-[#070913] text-slate-600 py-6 text-center mt-auto text-xs" id="app-footer-bar">
        <p className="font-sans">
          &copy; {new Date().getFullYear()} Flyer Prompt Generator Premium. Didukung oleh teknologi Google Gemini AI & React.
        </p>
      </footer>
    </div>
  );
}
