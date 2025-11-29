import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResult from './components/AnalysisResult';
import { analyzeVideo } from './services/geminiService';
import { fileToGenerativePart } from './utils';
import { AnalysisData, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    // Increased limit to 100MB to support larger high-quality ads
    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg("File too large. Please upload a video under 100MB.");
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      const base64Data = await fileToGenerativePart(file);
      const data = await analyzeVideo(base64Data, file.type);
      setAnalysisData(data);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze video. The file might be too complex for inline analysis, or the format is unsupported.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setAnalysisData(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-brand-text selection:bg-brand-accent selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-brand-muted/20 bg-brand-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center font-bold text-white font-mono">
              AI
            </div>
            <span className="font-bold text-xl tracking-tight">VIRALAUDIT AI</span>
          </div>
          <div className="text-xs font-mono text-brand-muted bg-brand-gray px-2 py-1 rounded border border-brand-muted/30">
             v1.0 • GEMINI 2.5
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Intro Header */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white max-w-5xl mx-auto leading-tight">
              Stop guessing what's wrong with your ads. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-red-600">We will tell you exactly how to fix them.</span>
            </h1>
            <p className="text-xl text-brand-muted max-w-2xl mx-auto">
              Our AI Creative Director analyzes your video for engagement, storytelling, and copy flaws. Get a brutal, data-driven critique in seconds. No AI slop , no generic results, just perfected fixes uniquely made for your ad.
            </p>
          </div>
        )}

        {/* Upload State */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} disabled={false} />
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-brand-muted">
               <div className="p-3 bg-brand-gray rounded border border-brand-muted/10">
                 <span className="block font-bold text-brand-text mb-1">Visuals</span>
                 Color & Pacing
               </div>
               <div className="p-3 bg-brand-gray rounded border border-brand-muted/10">
                 <span className="block font-bold text-brand-text mb-1">Audio</span>
                 Voice & Music
               </div>
               <div className="p-3 bg-brand-gray rounded border border-brand-muted/10">
                 <span className="block font-bold text-brand-text mb-1">Copy</span>
                 Hooks & CTA
               </div>
               <div className="p-3 bg-brand-gray rounded border border-brand-muted/10">
                 <span className="block font-bold text-brand-text mb-1">Story</span>
                 Hero's Journey
               </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-brand-gray rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-accent rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold animate-pulse">Analysing Ad Performance...</h2>
            <p className="text-brand-muted mt-2">Checking hook retention, audio clarity, and copy complexity.</p>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="max-w-lg mx-auto text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 text-brand-accent mb-6 border-2 border-brand-accent">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
             <p className="text-brand-muted mb-8">{errorMsg}</p>
             <button 
               onClick={reset}
               className="px-6 py-3 bg-brand-text text-brand-dark font-bold rounded hover:bg-white transition-colors"
             >
               Try Again
             </button>
          </div>
        )}

        {/* Success / Results State */}
        {appState === AppState.SUCCESS && analysisData && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Analysis Results</h2>
              <button 
                onClick={reset}
                className="text-sm text-brand-muted hover:text-white underline decoration-brand-accent decoration-2 underline-offset-4"
              >
                Analyze Another Video
              </button>
            </div>
            <AnalysisResult data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;