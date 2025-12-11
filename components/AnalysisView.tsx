import React, { useState } from 'react';
import { AnalysisResult, DifficultyLevel, WebSource } from '../types';
import { CheckCircle, AlertTriangle, ArrowRight, Star, BarChart2, Terminal, Play, Loader2, Image as ImageIcon, FileText, Copy, Globe, ExternalLink } from 'lucide-react';
import { executePrompt, executeImagePrompt } from '../services/geminiService';
import { ToastType } from './Toast';

interface AnalysisViewProps {
  result: AnalysisResult;
  prompt: string;
  onUseImproved: (prompt: string) => void;
  onShowToast: (message: string, type: ToastType) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, prompt, onUseImproved, onShowToast }) => {
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [currentSources, setCurrentSources] = useState<WebSource[] | undefined>(undefined);
  
  const [improvedOutput, setImprovedOutput] = useState<string>('');
  const [improvedSources, setImprovedSources] = useState<WebSource[] | undefined>(undefined);

  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingImproved, setLoadingImproved] = useState(false);
  
  // Independent modes for current vs improved (though likely similar intent)
  const [currentMode, setCurrentMode] = useState<'text' | 'image'>('text');
  const [improvedMode, setImprovedMode] = useState<'text' | 'image'>('text');

  const handleRunCurrent = async () => {
    setLoadingCurrent(true);
    setCurrentSources(undefined);
    try {
      const res = currentMode === 'image' 
        ? await executeImagePrompt(prompt)
        : await executePrompt(prompt);
      setCurrentOutput(res.content);
      setCurrentSources(res.webSources);
    } catch (error) {
      setCurrentOutput("Error generating output.");
      onShowToast("Failed to generate output", "error");
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleRunImproved = async () => {
    setLoadingImproved(true);
    setImprovedSources(undefined);
    try {
      const res = improvedMode === 'image'
        ? await executeImagePrompt(result.improvedPrompt)
        : await executePrompt(result.improvedPrompt);
      setImprovedOutput(res.content);
      setImprovedSources(res.webSources);
    } catch (error) {
      setImprovedOutput("Error generating output.");
      onShowToast("Failed to generate output", "error");
    } finally {
      setLoadingImproved(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast("Copied to clipboard!", "success");
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 border-green-400';
    if (score >= 5) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getLevelColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.ADVANCED: return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case DifficultyLevel.INTERMEDIATE: return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case DifficultyLevel.BEGINNER: return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const renderOutput = (content: string, isLoading: boolean, sources?: WebSource[]) => {
    if (isLoading) {
      return (
        <span className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating response...
        </span>
      );
    }
    if (content.startsWith('data:image')) {
      return (
        <div className="flex justify-center">
           <img src={content} alt="Generated" className="max-w-full h-auto rounded-lg max-h-64 border border-slate-700" />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <div>{content}</div>
        {sources && sources.length > 0 && (
          <div className="pt-3 border-t border-white/10">
             <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-semibold uppercase">
                <Globe className="w-3 h-3" /> Sources
             </div>
             <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full text-slate-300 transition-colors">
                    {s.title}
                    <ExternalLink className="w-2 h-2 opacity-50" />
                  </a>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Prompt Score</h3>
            <p className="text-slate-200 text-sm">Effectiveness rating</p>
          </div>
          <div className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
            <span className="text-xs absolute bottom-1 text-slate-500">/10</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Proficiency Level</h3>
            <p className="text-slate-200 text-sm">Engineering Complexity</p>
          </div>
          <div className={`px-4 py-2 rounded-full border font-semibold ${getLevelColor(result.level)}`}>
            {result.level}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-500" />
          Analysis Summary
        </h3>
        <p className="text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-800/30 border border-green-900/30 rounded-xl p-6">
          <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-800/30 border border-red-900/30 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {result.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Current Output Simulation Block */}
      <div className="bg-black/20 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              Current Output Simulation
            </h3>
            <p className="text-xs text-slate-500 mt-1">See what your original prompt generates</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700 mr-2">
                <button
                onClick={() => setCurrentMode('text')}
                className={`p-1.5 rounded-md transition-all ${currentMode === 'text' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                title="Text Generation"
                >
                <FileText className="w-3 h-3" />
                </button>
                <button
                onClick={() => setCurrentMode('image')}
                className={`p-1.5 rounded-md transition-all ${currentMode === 'image' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                title="Image Generation"
                >
                <ImageIcon className="w-3 h-3" />
                </button>
            </div>

            <button 
                onClick={handleRunCurrent}
                disabled={loadingCurrent}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
                {loadingCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {currentOutput ? 'Re-run' : 'Generate Output'}
            </button>
          </div>
        </div>
        
        {(currentOutput || loadingCurrent) && (
          <div className="p-4 bg-black/40 font-mono text-sm text-slate-300 border-t border-slate-800/50 leading-relaxed whitespace-pre-wrap">
             {renderOutput(currentOutput, loadingCurrent, currentSources)}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
         <h3 className="text-indigo-300 font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Expert Tips
          </h3>
          <ul className="space-y-3">
             {result.suggestions.map((tip, idx) => (
               <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-indigo-500/10">
                 <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                   {idx + 1}
                 </div>
                 <span className="text-slate-200 text-sm">{tip}</span>
               </li>
             ))}
          </ul>
      </div>

      {/* Improved Prompt Action */}
      <div className="bg-slate-900 border border-primary-600 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Star className="w-32 h-32 text-primary-500" />
        </div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
            <h3 className="text-white font-semibold">Suggested Master Prompt</h3>
            <button 
              onClick={() => handleCopy(result.improvedPrompt)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
        </div>

        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-green-300 mb-4 whitespace-pre-wrap border border-white/10 relative z-10">
          {result.improvedPrompt}
        </div>

        {/* Improved Prompt Output Preview */}
        {improvedOutput && (
           <div className="mb-4 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 relative z-10">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                <Terminal className="w-3 h-3" /> Output Preview
              </div>
              <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
                 {renderOutput(improvedOutput, false, improvedSources)}
              </div>
           </div>
        )}

        <div className="flex flex-wrap gap-3 relative z-10">
            <button 
              onClick={() => onUseImproved(result.improvedPrompt)}
              className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Use This Prompt
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-600">
                <button
                onClick={() => setImprovedMode('text')}
                className={`p-1.5 rounded-md transition-all ${improvedMode === 'text' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Text Generation"
                >
                <FileText className="w-4 h-4" />
                </button>
                <button
                onClick={() => setImprovedMode('image')}
                className={`p-1.5 rounded-md transition-all ${improvedMode === 'image' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Image Generation"
                >
                <ImageIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-full bg-slate-600 mx-1"></div>
                <button 
                onClick={handleRunImproved}
                disabled={loadingImproved}
                className="text-white px-3 text-sm font-medium transition-colors flex items-center gap-2"
                >
                {loadingImproved ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {improvedOutput ? 'Re-run' : 'Preview'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;