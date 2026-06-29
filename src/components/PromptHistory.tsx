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
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 text-center" id="empty-history-card">
        <History className="w-8 h-8 text-slate-700 mx-auto mb-3" />
        <h4 className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider">Belum Ada Riwayat</h4>
        <p className="text-[11px] text-slate-500 font-sans mt-1">Prompt flyer yang Anda rancang atau optimasi dengan AI akan tersimpan di sini secara otomatis.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 backdrop-blur-sm space-y-4" id="prompt-history-panel">
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <History className="w-4 h-4 text-indigo-400" />
          </span>
          <div>
            <h3 className="text-sm font-display font-bold text-slate-200">
              Riwayat Prompt Anda ({history.length})
            </h3>
            <p className="text-[10px] text-slate-500">Tersimpan secara lokal di browser</p>
          </div>
        </div>
        
        <button
          onClick={onClearAll}
          className="text-[10px] text-rose-400 hover:text-rose-300 font-sans font-bold flex items-center gap-1 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all"
          id="clear-all-history-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus Semua
        </button>
      </div>

      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1" id="history-items-list">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all duration-200 flex flex-col gap-3 group relative"
            id={`history-item-${item.id}`}
          >
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-400 font-sans font-semibold flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-850">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  {formatDate(item.timestamp)}
                </span>
                
                <span className="text-[10px] text-slate-200 font-sans font-semibold">
                  {item.input.productName}
                </span>

                <span className="text-[9px] font-mono bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded uppercase border border-slate-850">
                  {item.input.aspectRatio}
                </span>

                {item.isAiEnhanced && (
                  <span className="text-[8px] font-mono bg-fuchsia-500/10 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/20 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    AI
                  </span>
                )}
              </div>

              <button
                onClick={() => onDeletePrompt(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Hapus dari riwayat"
                id={`delete-item-btn-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt Preview Snippets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans">
              
              {/* English Version */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-indigo-400 uppercase block tracking-wider mb-1">PROMPT ENGLISH</span>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed italic font-mono text-[9px]">"{item.promptEng}"</p>
                </div>
                <button
                  onClick={() => onCopyPrompt(item.promptEng)}
                  className="mt-2 text-[9px] text-slate-300 hover:text-indigo-300 font-bold flex items-center gap-1 text-left"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  Salin English Prompt
                </button>
              </div>

              {/* Indonesian Version */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-fuchsia-400 uppercase block tracking-wider mb-1">PROMPT INDONESIA</span>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">"{item.promptIndo}"</p>
                </div>
                <button
                  onClick={() => onCopyPrompt(item.promptIndo)}
                  className="mt-2 text-[9px] text-slate-300 hover:text-fuchsia-300 font-bold flex items-center gap-1 text-left"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
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
