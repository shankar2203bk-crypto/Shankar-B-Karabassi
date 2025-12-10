import React, { useState, useEffect } from 'react';
import { Play, Loader2, RefreshCw, Image as ImageIcon, FileText } from 'lucide-react';
import { executePrompt, executeImagePrompt } from '../services/geminiService';

interface SimulationViewProps {
  prompt: string;
}

const SimulationView: React.FC<SimulationViewProps> = ({ prompt }) => {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setHasRun(true);
    
    let result = '';
    if (mode === 'image') {
      result = await executeImagePrompt(prompt);
    } else {
      result = await executePrompt(prompt);
    }
    
    setOutput(result);
    setLoading(false);
  };

  // Auto-run when component mounts if prompt is present and hasn't run yet
  useEffect(() => {
    if (prompt && !hasRun) {
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isImageOutput = output.startsWith('data:image');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Prompt Context</span>
            <div className="flex gap-2">
               <div className="bg-slate-900 rounded-lg p-1 flex border border-slate-700">
                  <button
                    onClick={() => { setMode('text'); setHasRun(false); }}
                    className={`p-1.5 rounded-md transition-all ${mode === 'text' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Text Generation"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setMode('image'); setHasRun(false); }}
                    className={`p-1.5 rounded-md transition-all ${mode === 'image' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Image Generation"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
               </div>
               <button 
                  onClick={handleRun}
                  disabled={loading || !prompt}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1 border border-slate-600"
              >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Re-run
              </button>
            </div>
        </div>
        <p className="text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
            {prompt || "No prompt provided."}
        </p>
      </div>

      <div className="bg-black/20 border border-slate-700 rounded-xl overflow-hidden min-h-[400px] flex flex-col">
        <div className="bg-slate-900/50 border-b border-slate-700 p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="text-slate-400 text-xs ml-2">
              {mode === 'image' ? 'Image Output Simulation' : 'Text Output Simulation'}
            </span>
        </div>
        
        <div className="p-6 flex-grow flex flex-col items-center justify-center font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    <p>Generating {mode} from Gemini...</p>
                </div>
            ) : output ? (
                isImageOutput ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={output} 
                      alt="Generated" 
                      className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700" 
                      style={{ maxHeight: '500px' }}
                    />
                    <a 
                      href={output} 
                      download="generated-image.png" 
                      className="mt-4 text-xs text-primary-400 hover:text-primary-300 hover:underline"
                    >
                      Download Image
                    </a>
                  </div>
                ) : (
                  <div className="w-full text-left">{output}</div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Play className="w-8 h-8 mb-2 opacity-50" />
                    <p>Ready to simulate prompt.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SimulationView;