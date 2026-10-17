import React, { useState } from 'react';
import { X, ExternalLink, Check, Copy, Terminal, Globe, Rocket } from 'lucide-react';

interface VercelDeployGuideModalProps {
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#233D4D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#F5FBE6] rounded-2xl shadow-2xl border border-[#215E61]/25 p-6 md:p-8 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#215E61]/15 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#215E61] flex items-center justify-center text-[#F5FBE6]">
              <Rocket size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#233D4D]">
                Publishing to Vercel
              </h3>
              <p className="text-xs text-[#536D7D]">
                Deploy this app online for free in under two minutes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#233D4D]/60 hover:text-[#215E61] rounded-lg hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#233D4D]">
          
          {/* Option 1: Via GitHub & Vercel Dashboard (Easiest) */}
          <div className="bg-[#FAFDF3] p-5 rounded-xl border border-[#215E61]/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#215E61]">
              <Globe size={14} /> Method 1: Push to GitHub & One-Click Import (Recommended)
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#233D4D]/90 leading-relaxed">
              <li>
                Upload or push this project folder to your GitHub account (e.g. repo named <code className="bg-[#215E61]/10 px-1 py-0.5 rounded text-[#215E61]">book-app</code>).
              </li>
              <li>
                Log in to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-[#215E61] font-semibold underline inline-flex items-center gap-0.5">vercel.com <ExternalLink size={11} /></a>.
              </li>
              <li>
                Click <strong>"Add New..." → "Project"</strong> and select your GitHub repository.
              </li>
              <li>
                Vercel will auto-detect <strong>Vite</strong> with preset build command:
                <div className="mt-1.5 p-2.5 bg-[#233D4D] text-[#F5FBE6] rounded-lg font-mono text-[11px] flex justify-between items-center">
                  <span>Build Command: npm run build &nbsp;|&nbsp; Output Dir: dist</span>
                </div>
              </li>
              <li>
                Click <strong>Deploy</strong>! Within 30 seconds, your site is live worldwide on a free <code className="bg-[#215E61]/10 px-1 py-0.5 rounded text-[#215E61]">.vercel.app</code> URL.
              </li>
            </ol>
          </div>

          {/* Option 2: Via Vercel CLI */}
          <div className="bg-[#FAFDF3] p-5 rounded-xl border border-[#215E61]/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#215E61]">
              <Terminal size={14} /> Method 2: Deploy directly from Terminal (Vercel CLI)
            </div>
            <p className="text-xs text-[#536D7D]">
              Open your PowerShell or terminal in this folder and run:
            </p>
            <div className="p-3 bg-[#233D4D] text-[#F5FBE6] rounded-xl font-mono text-xs flex items-center justify-between">
              <code>npx vercel</code>
              <button
                onClick={() => copyToClipboard('npx vercel', 2)}
                className="text-xs text-[#F5FBE6]/80 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedStep === 2 ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedStep === 2 ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-[#536D7D] italic">
              Follow the quick 3-step prompt to link to your free Vercel account and deploy immediately.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#215E61]/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#215E61] text-[#F5FBE6] text-xs font-semibold hover:bg-[#1a4a4d] transition-colors"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
