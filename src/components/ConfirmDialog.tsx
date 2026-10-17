import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233D4D]/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FAFDF3] rounded-2xl shadow-2xl border-2 border-[#215E61]/30 p-6 book-paper-texture">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-[#233D4D]/50 hover:text-[#215E61] rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-[#215E61]/10 text-[#215E61] border border-[#215E61]/20'
          }`}>
            {isDestructive ? <Trash2 size={20} /> : <AlertCircle size={20} />}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="font-serif font-bold text-base text-[#233D4D] mb-1">
              {title}
            </h3>
            <p className="text-xs text-[#536D7D] font-serif leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#215E61]/15 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[#215E61]/25 hover:bg-black/5 text-[#233D4D] text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'bg-[#215E61] hover:bg-[#1a4a4d] text-[#F5FBE6]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
