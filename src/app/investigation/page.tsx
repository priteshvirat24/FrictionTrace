"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FrictionMoment, CATEGORY_META, FrictionCategory } from '@/lib/types';
import { getMoments, getSettings } from '@/lib/storage';

export default function InvestigationPage() {
  const router = useRouter();
  const [moments, setMoments] = useState<FrictionMoment[]>([]);
  const [selectedMomentId, setSelectedMomentId] = useState<string>('');
  
  const [status, setStatus] = useState<string>('idle'); // idle, loading, complete, error
  const [insight, setInsight] = useState<any>(null);
  const [safetyFlags, setSafetyFlags] = useState<string[]>([]);

  useEffect(() => {
    const loaded = getMoments().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setMoments(loaded);
    if (loaded.length > 0) {
      setSelectedMomentId(loaded[0].id);
    }
  }, []);

  const handleInvestigate = async () => {
    setStatus('loading');
    setInsight(null);
    setSafetyFlags([]);

    try {
      const settings = getSettings();
      
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momentId: selectedMomentId,
          localHistoryMoments: moments,
          supportPreferences: settings.supportPreferences,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Investigation failed');
      
      setStatus('complete');
      setInsight(data.insight);
      setSafetyFlags(data.safetyFlags || []);

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="page-container space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">AI Investigation</h1>
        <p className="mt-2 text-slate-400">
          Have our Evidence Agent review your history to find patterns behind a specific friction moment.
        </p>
      </header>

      <div className="glass-panel p-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Select a moment to investigate</label>
        <select 
          value={selectedMomentId}
          onChange={(e) => setSelectedMomentId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 mb-4 focus:ring-2 focus:ring-blue-500"
        >
          {moments.map(m => (
            <option key={m.id} value={m.id}>
              {formatDate(m.timestamp)} — {m.categories.map((c: FrictionCategory) => CATEGORY_META[c]?.label || c).join(', ')} 
              {m.textNote ? ` "${m.textNote.substring(0, 30)}..."` : ''}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handleInvestigate}
          disabled={status === 'loading' || moments.length === 0}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Investigating...' : 'Investigate Moment'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="glass-panel p-6 space-y-4 animate-pulse">
          <h3 className="text-xl font-semibold text-slate-200">Evidence Agent at work...</h3>
          <ul className="space-y-2 text-slate-400">
            <li>✓ Analyzing friction event...</li>
            <li>✓ Searching similar situations in your history...</li>
            <li>✓ Checking what has helped before...</li>
            <li>✓ Comparing evidence and validating pattern...</li>
            <li>✓ Verifying safety...</li>
          </ul>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-2">Investigation Failed</h3>
          <p>The AI investigation encountered an error. Please try again later.</p>
        </div>
      )}

      {status === 'complete' && safetyFlags.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-2">Safety Guardrail Activated</h3>
          <p>The agent generated output that violated our strict no-diagnosis safety policies. The output was blocked.</p>
          <ul className="list-disc ml-5 mt-2 opacity-80">
            {safetyFlags.map((flag, i) => <li key={i}>{flag}</li>)}
          </ul>
        </div>
      )}

      {status === 'complete' && insight && safetyFlags.length === 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 border border-blue-500/30 bg-blue-900/10">
            <h2 className="text-2xl font-semibold text-blue-100 mb-4">Investigation Results</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              {insight.summary}
            </p>
            
            {insight.patterns?.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-slate-200">Evidence-Backed Patterns</h3>
                {insight.patterns.map((p: any, i: number) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="font-medium text-blue-200 text-lg">{p.statement}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {p.sampleSize} related moments
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${p.evidenceStrength === 'strong' ? 'bg-green-500' : p.evidenceStrength === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        {p.evidenceStrength} evidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => router.push(`/receipt?from=investigation&momentId=${selectedMomentId}`)}
              className="w-full bg-slate-100 hover:bg-white text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Draft Friction Receipt from Evidence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
