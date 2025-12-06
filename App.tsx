import React, { useState } from 'react';
import { DEFAULT_PATTERNS, Icons } from './constants';
import { BreathingPattern, Screen } from './types';
import BreathingSimulator from './components/BreathingSimulator';
import { getCustomBreathingExercise } from './services/geminiService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    setScreen('simulator');
  };

  const handleCustomGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const pattern = await getCustomBreathingExercise(customInput);
      startPattern(pattern);
    } catch (err) {
      setErrorMsg("호흡법 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 flex flex-col max-w-2xl mx-auto">
      <header className="py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-calm-300 to-indigo-300 bg-clip-text text-transparent">
          MindBreath
        </h1>
        <p className="text-slate-400 mt-2">호흡을 통해 삶의 균형을 찾아보세요.</p>
      </header>

      {/* AI Assistant Section */}
      <section className="mb-10 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
            <Icons.Sparkles />
          </div>
          <h2 className="text-xl font-semibold">현재 어떤 기분이신가요?</h2>
        </div>
        <form onSubmit={handleCustomGeneration} className="relative">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="예: 중요한 발표 때문에 긴장돼요, 잠이 안 와요..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-calm-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-slate-200"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !customInput.trim()}
            className="absolute right-2 top-2 bottom-2 bg-calm-600 hover:bg-calm-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
          >
            {isGenerating ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "시작"
            )}
          </button>
        </form>
        {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
      </section>

      {/* Preset Categories */}
      <section>
        <h3 className="text-lg font-semibold text-slate-300 mb-4">추천 호흡법</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEFAULT_PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => startPattern(pattern)}
              className="group text-left p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-calm-500/50 hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-calm-900/20 active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-slate-700/50 text-calm-300 group-hover:bg-calm-950 group-hover:text-calm-400 transition-colors">
                  {pattern.id.includes('box') ? <Icons.Box /> : 
                   pattern.id.includes('4-7-8') ? <Icons.Moon /> :
                   pattern.id.includes('energiz') ? <Icons.Wind /> : <Icons.Sun />}
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {pattern.inhale}-{pattern.holdTop}-{pattern.exhale}-{pattern.holdBottom}
                </span>
              </div>
              <h4 className="font-semibold text-slate-200 text-lg group-hover:text-calm-200">{pattern.name}</h4>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pattern.description}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {pattern.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
      
      <footer className="mt-12 text-center text-slate-600 text-sm pb-8">
        <p>© 2024 MindBreath. 호흡은 몸과 마음을 잇는 가장 강력한 도구입니다.</p>
      </footer>
    </div>
  );

  return (
    <>
      {screen === 'home' && renderHome()}
      {screen === 'simulator' && selectedPattern && (
        <BreathingSimulator 
          pattern={selectedPattern} 
          onExit={() => setScreen('home')} 
        />
      )}
    </>
  );
};

export default App;