import React, { useState } from 'react';
import { PlayCircle, BarChart, Eraser, Info, Loader2, LogOut } from 'lucide-react';
import { AnalysisResult, Tab } from './types';
import { analyzePrompt } from './services/geminiService';
import AnalysisView from './components/AnalysisView';
import SimulationView from './components/SimulationView';
import LoginPage from './components/LoginPage';
import Logo from './components/Logo';
import Toast, { ToastType } from './components/Toast';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [simulationPrompt, setSimulationPrompt] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    showToast("Welcome to ForgeIQ", "success");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    handleClear();
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setIsAnalyzing(true);
    setActiveTab('analysis');
    setAnalysisResult(null); // Clear previous result
    
    try {
      const result = await analyzePrompt(prompt);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed", error);
      showToast("Analysis failed. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunSimulation = () => {
    setSimulationPrompt(prompt);
    setActiveTab('simulation');
  };

  const handleApplyImproved = (improved: string) => {
    setPrompt(improved);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Applied improved prompt to editor", "success");
  };

  const handleClear = () => {
    setPrompt('');
    setAnalysisResult(null);
    setSimulationPrompt('');
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30 selection:text-primary-200 font-sans">
      {/* Background Gradients - persistent across views */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Adjusted gradients to be warmer/vintage to match the logo */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-700/20 rounded-full blur-[120px]" />
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <header className="mb-10 text-center relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm px-3 py-2 rounded-lg hover:bg-slate-800"
                 >
                    <LogOut className="w-4 h-4" />
                    Log out
                 </button>
              </div>
              
              <div className="flex justify-center mb-6">
                 {/* Logo Component */}
                 <div className="relative group">
                    <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                    <Logo className="h-28 w-28 md:h-36 md:w-36 relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                 </div>
              </div>

              {/* Mobile logout */}
              <div className="md:hidden flex justify-end mt-2">
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs"
                 >
                    <LogOut className="w-3 h-3" />
                    Log out
                 </button>
              </div>
            </header>

            {/* Main Interface */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Input Area */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-1 shadow-lg">
                  <div className="bg-slate-900 rounded-xl border border-slate-800/50 overflow-hidden group focus-within:border-primary-500/50 transition-colors">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here (e.g., 'Write a blog post about coffee')..."
                      className="w-full h-64 md:h-96 bg-transparent text-slate-200 p-6 resize-none focus:outline-none focus:ring-0 placeholder:text-slate-600 leading-relaxed text-base"
                    />
                    <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                      <span>{prompt.length} chars</span>
                      <button onClick={handleClear} className="hover:text-red-400 transition-colors flex items-center gap-1">
                        <Eraser className="w-3 h-3" /> Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !prompt.trim()}
                    className={`
                      flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all shadow-lg
                      ${isAnalyzing || !prompt.trim() 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-primary-600 hover:bg-primary-500 text-white hover:shadow-primary-500/25 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart className="w-5 h-5" />}
                    {isAnalyzing ? 'Analyzing...' : 'Check Prompt'}
                  </button>

                  <button
                    onClick={handleRunSimulation}
                    disabled={!prompt.trim()}
                    className={`
                      flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all shadow-lg border border-slate-700
                      ${!prompt.trim()
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-white hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Simulate
                  </button>
                </div>
                
                {!analysisResult && !isAnalyzing && (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center">
                    <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-slate-200 font-medium mb-1">Ready to start?</h3>
                    <p className="text-slate-400 text-sm">Type a prompt above and click "Check Prompt" to get a detailed breakdown and score.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Results Area */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl min-h-[600px] flex flex-col">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-800">
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2
                        ${activeTab === 'analysis' 
                          ? 'border-primary-500 text-primary-400 bg-primary-500/5' 
                          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                      <BarChart className="w-4 h-4" />
                      Analysis
                    </button>
                    <button
                      onClick={() => {
                        if (prompt) {
                            setSimulationPrompt(prompt);
                            setActiveTab('simulation');
                        } else {
                            showToast("Please enter a prompt first", "info");
                        }
                      }}
                      className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2
                        ${activeTab === 'simulation' 
                          ? 'border-green-500 text-green-400 bg-green-500/5' 
                          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Simulation
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex-grow">
                    {activeTab === 'analysis' ? (
                      isAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-slate-800 mb-4"></div>
                            <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                            <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                            <p className="text-sm mt-8">Analysing structure, clarity, and effectiveness...</p>
                        </div>
                      ) : analysisResult ? (
                        <AnalysisView 
                          result={analysisResult} 
                          prompt={prompt} 
                          onUseImproved={handleApplyImproved}
                          onShowToast={showToast}
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-8">
                           <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                              <BarChart className="w-10 h-10 text-slate-600" />
                           </div>
                           <h3 className="text-lg font-medium text-slate-400 mb-2">No Analysis Yet</h3>
                           <p className="max-w-xs mx-auto text-sm">Analyze your prompt to see its score, difficulty level, and improvement suggestions.</p>
                        </div>
                      )
                    ) : (
                      <SimulationView 
                        prompt={simulationPrompt} 
                        onShowToast={showToast}
                      />
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;