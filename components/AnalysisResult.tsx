import React from 'react';
import { AnalysisData, SpecificCheck } from '../types';

interface Props {
  data: AnalysisData;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = 'text-red-500 border-red-500';
  if (score >= 80) colorClass = 'text-green-500 border-green-500';
  else if (score >= 50) colorClass = 'text-yellow-500 border-yellow-500';

  return (
    <div className={`flex items-center justify-center w-24 h-24 rounded-full border-4 ${colorClass} text-3xl font-bold bg-brand-dark`}>
      {score}
    </div>
  );
};

const StatusChip: React.FC<{ status: 'PASS' | 'FAIL' | 'WARN' }> = ({ status }) => {
  const colors = {
    PASS: 'bg-green-900/50 text-green-400 border-green-800',
    FAIL: 'bg-red-900/50 text-red-400 border-red-800',
    WARN: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-mono border ${colors[status]}`}>
      {status}
    </span>
  );
};

const CheckItem: React.FC<{ check: SpecificCheck }> = ({ check }) => (
  <div className="flex flex-col h-full p-4 bg-brand-gray rounded border border-brand-muted/20">
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold text-sm uppercase tracking-wider text-brand-muted">{check.label}</span>
      <StatusChip status={check.status} />
    </div>
    <p className="text-sm text-brand-text mb-2">{check.details}</p>
    
    {(check.status === 'FAIL' || check.status === 'WARN') && (
       <div className="mt-auto pt-3 border-t border-brand-muted/10">
         <div className="flex items-center gap-2 mb-1">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           <span className="text-xs font-bold text-brand-accent uppercase tracking-wide">The Fix</span>
         </div>
         <p className="text-sm text-brand-text/90 italic bg-brand-dark/30 p-2 rounded border-l-2 border-brand-accent">
            "{check.fix && check.fix !== 'None' ? check.fix : "Review this element to improve ad performance."}"
         </p>
       </div>
    )}
  </div>
);

const AnalysisResult: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center bg-brand-gray p-8 rounded-lg border border-brand-muted/20">
        <div className="flex-shrink-0">
          <ScoreBadge score={data.overallScore} />
        </div>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-2 text-brand-text">Creative Director's Verdict</h2>
          <p className="text-lg text-brand-text/90 italic border-l-4 border-brand-accent pl-4 py-2 bg-brand-dark/50">
            "{data.brutalSummary}"
          </p>
        </div>
      </div>

      {/* Main Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Visuals', data: data.categories.visual },
          { title: 'Audio', data: data.categories.audio },
          { title: 'Copy', data: data.categories.copy }
        ].map((pillar) => (
          <div key={pillar.title} className="bg-brand-gray p-6 rounded-lg border border-brand-muted/20 hover:border-brand-accent/50 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-end mb-4 border-b border-brand-muted/30 pb-2">
              <h3 className="text-xl font-bold text-brand-text">{pillar.title}</h3>
              <span className={`text-2xl font-mono font-bold ${pillar.data.score > 70 ? 'text-green-400' : 'text-brand-accent'}`}>
                {pillar.data.score}/100
              </span>
            </div>
            <p className="text-brand-text/80 text-sm leading-relaxed mb-4">
              {pillar.data.feedback}
            </p>
            {pillar.data.score < 80 && (
               <div className="mt-auto pt-3 border-t border-brand-muted/10">
                 <div className="flex items-center gap-2 mb-1">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                   <span className="text-xs font-bold text-brand-accent uppercase tracking-wide">The Fix</span>
                 </div>
                 <p className="text-sm text-brand-text/90 italic bg-brand-dark/30 p-2 rounded border-l-2 border-brand-accent">
                    "{pillar.data.fix && pillar.data.fix !== 'None' ? pillar.data.fix : "Improve this element to boost performance."}"
                 </p>
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Specific Checks Grid */}
      <h3 className="text-2xl font-bold mt-12 mb-6 text-brand-text border-b border-brand-muted/30 pb-2">Diagnostic Checks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(data.checks).map((check, idx) => (
          <CheckItem key={idx} check={check} />
        ))}
      </div>

      {/* Timestamped Notes */}
      <h3 className="text-2xl font-bold mt-12 mb-6 text-brand-text border-b border-brand-muted/30 pb-2">Frame-by-Frame Analysis</h3>
      <div className="bg-brand-gray rounded-lg border border-brand-muted/20 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-dark text-brand-muted uppercase text-xs">
            <tr>
              <th className="px-6 py-3 w-32">Timestamp</th>
              <th className="px-6 py-3">Critique</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-muted/10">
            {data.timestampedNotes.map((note, idx) => (
              <tr key={idx} className="hover:bg-brand-dark/30 transition-colors">
                <td className="px-6 py-4 font-mono text-brand-accent font-bold">{note.time}</td>
                <td className="px-6 py-4 text-brand-text">{note.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisResult;