import React from 'react';
import { History, Copy, Trash2, Calendar, Sparkles, Layout, Compass } from 'lucide-react';
import { SavedPrompt } from '../types';

interface PromptHistoryProps {
  history: SavedPrompt[];
  onCopyPrompt: (text: string) => void;
  onDeletePrompt: (id: string) => void;
  onClearAll: () => void;
}

export default function PromptHistory({
  history,
  onCopyPrompt,
  onDeletePrompt,
  onClearAll,
}: PromptHistoryProps) {
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center shadow-sm" id="empty-history-card">
        <History className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h4 className="text-xs font-display font-bold text-slate-500 uppercase tracking-wider">Belum Ada Riwayat</h4>
        <p className="text-[11px] text-slate-400 font-sans mt-1">Prompt flyer yang Anda rancang atau optimasi dengan AI akan tersimpan di sini secara otomatis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5" id="prompt-history-panel">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <History className="w-4 h-4 text-indigo-600" />
          </span>
          <div>
            <h3 className="text-sm font-display font-bold text-slate-800">
              Riwayat Prompt Anda ({history.length})
            </h3>
            <p className="text-[10px] text-slate-450 font-medium">Tersimpan secara lokal di browser Anda</p>
          </div>
        </div>
        
        <button
          onClick={onClearAll}
          className="text-[10px] text-rose-600 hover:text-rose-700 font-sans font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-xl transition-all shadow-sm"
          id="clear-all-history-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua
        </button>
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1" id="history-items-list">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-50/55 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-2xl transition-all duration-250 flex flex-col gap-3.5 group relative"
            id={`history-item-${item.id}`}
          >
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-600 font-sans font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                  <Calendar className="w-3 h-3 text-indigo-550" />
                  {formatDate(item.timestamp)}
                </span>
                
                <span className="text-xs text-slate-800 font-sans font-extrabold bg-indigo-50 px-2 py-0.5 rounded-lg text-indigo-755 border border-indigo-100/40">
                  {item.input.productName}
                </span>

                <span className="text-[9px] font-mono bg-white text-slate-650 px-1.5 py-0.5 rounded-md uppercase border border-slate-200 font-bold">
                  {item.input.aspectRatio}
                </span>

                {item.isAiEnhanced && (
                  <span className="text-[8px] font-mono bg-fuchsia-50 text-fuchsia-600 px-2.5 py-1 rounded-full border border-fuchsia-100 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    AI ENHANCED
                  </span>
                )}
              </div>

              <button
                onClick={() => onDeletePrompt(item.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Hapus dari riwayat"
                id={`delete-item-btn-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt Preview Snippets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-sans">
              
              {/* English Version */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[8px] font-bold text-indigo-600 uppercase block tracking-wider mb-1">PROMPT ENGLISH</span>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed italic font-mono text-[9px] bg-slate-50/40 p-1.5 rounded-lg border border-slate-100">"{item.promptEng}"</p>
                </div>
                <button
                  onClick={() => onCopyPrompt(item.promptEng)}
                  className="mt-2 text-[9px] text-indigo-650 hover:text-indigo-800 font-bold flex items-center gap-1 text-left"
                >
                  <Copy className="w-3 h-3 text-indigo-500" />
                  Salin English Prompt
                </button>
              </div>

              {/* Indonesian Version */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[8px] font-bold text-fuchsia-600 uppercase block tracking-wider mb-1">PROMPT INDONESIA</span>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/40 p-1.5 rounded-lg border border-slate-100">"{item.promptIndo}"</p>
                </div>
                <button
                  onClick={() => onCopyPrompt(item.promptIndo)}
                  className="mt-2 text-[9px] text-fuchsia-650 hover:text-fuchsia-800 font-bold flex items-center gap-1 text-left"
                >
                  <Copy className="w-3 h-3 text-fuchsia-500" />
                  Salin Indo Prompt
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
