import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, Languages, Loader2, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translateImage, isApiKeyMissing } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isApiKeyMissing) {
      setShowKeyWarning(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setTranslation('');
    };
    reader.readAsDataURL(file);
  };

  const handleTranslate = async () => {
    if (!image) return;
    setIsTranslating(true);
    setError(null);
    try {
      const result = await translateImage(image, mimeType);
      setTranslation(result || 'No text found or translation failed.');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING') {
        setError('API Key is missing. Please configure GEMINI_API_KEY in your environment.');
        setShowKeyWarning(true);
      } else {
        setError('Translation failed. Please check your internet connection and API key.');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadPDF = () => {
    if (!translation) return;
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const textWidth = pageWidth - margin * 2;
    const maxLineHeight = pageHeight - margin * 2;
    
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Linguist Translation', margin, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 28);
    
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(margin, 32, pageWidth - margin, 32);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate-800
    const splitText = doc.splitTextToSize(translation, textWidth);
    
    let cursorY = 42;
    const lineHeight = 7;
    
    splitText.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });
    
    doc.save('translation.pdf');
  };

  const reset = () => {
    setImage(null);
    setTranslation('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Linguist</h1>
          </div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Image to English
          </div>
        </div>
      </header>

      {showKeyWarning && (
        <div className="bg-amber-50 border-b border-amber-100 py-3 px-6">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>
              <strong>API Key Missing:</strong> The translator won't work until you add <code>GEMINI_API_KEY</code> to your Vercel environment variables.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Upload & Preview */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Source Image</h2>
              {image && (
                <button 
                  onClick={reset}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                className="group relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4"
              >
                <div className="p-4 rounded-full bg-slate-50 group-hover:bg-indigo-100 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700">Drop your image here</p>
                  <p className="text-sm text-slate-400">or click to browse</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <img 
                  src={image} 
                  alt="Source" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 group"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    )}
                    {isTranslating ? 'Translating...' : 'Translate to English'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Translation Output */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">English Translation</h2>
              {translation && (
                <button 
                  onClick={downloadPDF}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              )}
            </div>

            <div className={cn(
              "min-h-[400px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all relative",
              !translation && "flex flex-col items-center justify-center text-slate-300"
            )}>
              {translation ? (
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                    {translation}
                  </p>
                </div>
              ) : (
                <>
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Translation will appear here</p>
                </>
              )}
              
              {isTranslating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-xs font-medium text-slate-500 animate-pulse">Processing image...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-400">
            Powered by Gemini 3 Flash & jsPDF
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Any Image Format</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Download className="w-4 h-4" />
              <span className="text-xs">PDF Export</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
