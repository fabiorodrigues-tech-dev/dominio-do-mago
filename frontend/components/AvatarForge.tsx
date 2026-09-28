'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Sparkles, Wand2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { uploadAvatarImages } from '../services/api';

interface AvatarForgeProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarForged: (avatarUrl: string) => void;
}

interface ImageSlot {
  label: string;
  file: File | null;
  previewUrl: string | null;
}

export default function AvatarForge({ isOpen, onClose, onAvatarForged }: AvatarForgeProps) {
  const [slots, setSlots] = useState<ImageSlot[]>([
    { label: 'Frente', file: null, previewUrl: null },
    { label: 'Lado Esquerdo', file: null, previewUrl: null },
    { label: 'Lado Direito', file: null, previewUrl: null },
    { label: 'Costas', file: null, previewUrl: null },
  ]);

  const [isForging, setIsForging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const fileList = Array.from(e.target.files);

    if (activeSlotIndex !== null) {
      // Atribui ao slot clicado especificamente
      const file = fileList[0];
      const previewUrl = URL.createObjectURL(file);
      setSlots(prev => prev.map((s, idx) => idx === activeSlotIndex ? { ...s, file, previewUrl } : s));
      setActiveSlotIndex(null);
    } else {
      // Distribui os arquivos nos primeiros slots vazios
      setSlots(prev => {
        const updated = [...prev];
        let fileIdx = 0;
        for (let i = 0; i < updated.length && fileIdx < fileList.length; i++) {
          if (!updated[i].file) {
            const file = fileList[fileIdx++];
            updated[i] = {
              ...updated[i],
              file,
              previewUrl: URL.createObjectURL(file),
            };
          }
        }
        return updated;
      });
    }

    // Limpa input
    e.target.value = '';
    setErrorMsg(null);
  };

  const removeSlotImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots(prev => prev.map((s, idx) => {
      if (idx === index) {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { ...s, file: null, previewUrl: null };
      }
      return s;
    }));
  };

  const triggerUploadForSlot = (index: number) => {
    setActiveSlotIndex(index);
    fileInputRef.current?.click();
  };

  const selectedFiles = slots.filter(s => s.file !== null).map(s => s.file as File);

  const handleForge = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Envie pelo menos 1 foto para dar forma à sua essência arcana.');
      return;
    }

    setIsForging(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await uploadAvatarImages(selectedFiles);
      setSuccessMsg('Essência transmuta! O Avatar 3D foi forjado.');
      setTimeout(() => {
        onAvatarForged(result.avatarUrl);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao forjar avatar. Tente novamente.');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 selection:bg-btn-primary/30">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl designcode-card p-6 md:p-8 shadow-2xl text-fg-primary overflow-hidden"
      >
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-btn-primary/20 border border-btn-primary/40 text-btn-primary">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                A Forja do Avatar 3D
              </h2>
              <p className="text-xs text-slate-400">
                Envie até 4 ângulos para a Tripo3D materializar sua projeção astral
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            disabled={isForging}
            aria-label="Fechar Forja"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Slots de Upload das 4 Fotos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          {slots.map((slot, index) => (
            <div
              key={slot.label}
              onClick={() => !isForging && triggerUploadForSlot(index)}
              className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all overflow-hidden group ${
                slot.previewUrl 
                  ? 'border-btn-primary/60 bg-container-bg shadow-lg' 
                  : 'border-slate-800 hover:border-container-border/80 bg-black/40'
              } ${isForging ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {slot.previewUrl ? (
                <>
                  <img 
                    src={slot.previewUrl} 
                    alt={slot.label} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] font-semibold text-fg-primary">{slot.label}</span>
                    <button 
                      onClick={(e) => removeSlotImage(index, e)}
                      className="p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-2">
                  <div className="p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-btn-primary transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{slot.label}</span>
                  <span className="text-[10px] text-slate-500">Clique para enviar</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Estado de Forja (Loading Místico) */}
        <AnimatePresence>
          {isForging && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl bg-container-bg border border-container-border flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-container-border border-t-cyan-400 border-r-btn-primary"
                />
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-fg-primary animate-pulse">
                  Transmutando matéria através dos planos astrais...
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gerando a malha 3D e renderizando os polígonos da sua Aura.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {selectedFiles.length} de 4 fotos selecionadas
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isForging}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleForge}
              disabled={isForging || selectedFiles.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-bold designcode-btn-primary shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {isForging ? 'Transmutando...' : 'Forjar Avatar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
