'use client';

interface AnalysisLoaderProps {
  title?: string;
  subtitle?: string;
}

export default function AnalysisLoader({
  title = "Authenticating...",
  subtitle = "Verifying credentials & securing your session"
}: AnalysisLoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md px-4 animate-in fade-in duration-300">
      
      {/* Wave Dot Animation Styles */}
      <style>{`
        @keyframes wave-bounce {
          0%, 100% {
            transform: translateY(4px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        .wave-dot {
          animation: wave-bounce 1.2s infinite ease-in-out;
        }
      `}</style>
      
      {/* Compact & Cute Responsive Card */}
      <div className="flex flex-col items-center justify-center p-5 sm:p-7 space-y-4 sm:space-y-5 rounded-3xl border border-indigo-100/30 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl max-w-[280px] sm:max-w-xs w-full transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Wave Animation Dots */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 mt-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="wave-dot w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            {subtitle}
          </p>
        </div>
        
      </div>
    </div>
  );
}