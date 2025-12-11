import React, { useState, useEffect } from 'react';
import { Play, Loader2, RefreshCw, Image as ImageIcon, FileText, Copy, Search, ExternalLink, Globe, Link as LinkIcon, Check, Zap } from 'lucide-react';
import { executePrompt, executeImagePrompt } from '../services/geminiService';
import { ToastType } from './Toast';
import { WebSource } from '../types';

interface SimulationViewProps {
  prompt: string;
  onShowToast?: (message: string, type: ToastType) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ prompt, onShowToast }) => {
  const [output, setOutput] = useState<string>('');
  const [sources, setSources] = useState<WebSource[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [enableGrounding, setEnableGrounding] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const googleSearchUrl = prompt.trim() 
    ? `https://www.google.com/search?q=${encodeURIComponent(prompt)}`
    : '';

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setHasRun(true);
    setSources(undefined);
    
    try {
        let result;
        if (mode === 'image') {
          result = await executeImagePrompt(prompt);
        } else {
          result = await executePrompt(prompt, enableGrounding);
        }
        setOutput(result.content);
        setSources(result.webSources);
    } catch (e) {
        setOutput("An error occurred during generation.");
        if (onShowToast) onShowToast("Simulation failed", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    if (onShowToast) onShowToast("Output copied to clipboard", "success");
  };

  const handleCopyLink = () => {
    if (!googleSearchUrl) return;
    navigator.clipboard.writeText(googleSearchUrl);
    setCopiedLink(true);
    if (onShowToast) onShowToast("Search link copied!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGoogleSearch = () => {
    if (!googleSearchUrl) return;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-3">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Prompt Context</span>
            
            <div className="flex flex-wrap gap-2 items-center">
               {/* Mode Switcher */}
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
               
               {/* Grounding Toggle (Text Mode Only) */}
               {mode === 'text' && (
                 <button 
                   onClick={() => setEnableGrounding(!enableGrounding)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                     enableGrounding 
                       ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' 
                       : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                   }`}
                   title="Toggle Google Search Grounding"
                 >
                   <Globe className={`w-3.5 h-3.5 ${enableGrounding ? 'text-blue-400' : 'text-slate-500'}`} />
                   {enableGrounding ? 'Grounding On' : 'Grounding Off'}
                 </button>
               )}

               <div className="w-px h-6 bg-slate-700 mx-1 hidden md:block"></div>

               {/* Re-run Button */}
               <button 
                  onClick={handleRun}
                  disabled={loading || !prompt}
                  className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-primary-500/20 font-medium"
              >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Run Simulation
              </button>
            </div>
        </div>
        
        <p className="text-slate-300 text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar mb-4">
            {prompt || "No prompt provided."}
        </p>

        {/* Google Search Link Section */}
        {prompt && (
           <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50 flex items-center gap-3">
              <div className="bg-blue-500/10 p-1.5 rounded text-blue-400">
                 <Search className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Google Search Link</div>
                 <div className="text-xs text-slate-400 font-mono truncate select-all">
                    {googleSearchUrl}
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Copy Link"
                 >
                    {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
                 </button>
                 <button 
                    onClick={handleGoogleSearch}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Open in new tab"
                 >
                    <ExternalLink className="w-4 h-4" />
                 </button>
              </div>
           </div>
        )}
      </div>

      <div className="bg-black/20 border border-slate-700 rounded-xl overflow-hidden min-h-[400px] flex flex-col relative group">
        <div className="bg-slate-900/50 border-b border-slate-700 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <span className="text-slate-400 text-xs ml-2 flex items-center gap-2">
                  {mode === 'image' ? (
                     <><ImageIcon className="w-3 h-3" /> Image Output</>
                  ) : (
                     <><FileText className="w-3 h-3" /> Text Output {enableGrounding && <span className="bg-blue-500/10 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20">Grounded</span>}</>
                  )}
                </span>
            </div>
            {output && !isImageOutput && (
                <button 
                    onClick={handleCopy}
                    className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy output"
                >
                    <Copy className="w-4 h-4" />
                </button>
            )}
        </div>
        
        <div className="p-6 flex-grow flex flex-col font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 m-auto">
                    <div className="relative">
                       <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                       <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <p>Generating {mode}...</p>
                      {mode === 'text' && enableGrounding && (
                         <p className="text-xs text-blue-400 mt-1 flex items-center justify-center gap-1">
                           <Globe className="w-3 h-3" /> Researching with Google
                         </p>
                      )}
                    </div>
                </div>
            ) : output ? (
                isImageOutput ? (
                  <div className="flex flex-col items-center m-auto">
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
                  <div className="w-full text-left animate-fade-in">
                    {output}
                    
                    {/* Grounding Sources Display */}
                    {sources && sources.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Sources
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
                            >
                              <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary-400">
                                <Globe className="w-3 h-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-primary-200">{source.title}</p>
                                <p className="text-[10px] text-slate-500 truncate">{new URL(source.uri).hostname}</p>
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 m-auto">
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