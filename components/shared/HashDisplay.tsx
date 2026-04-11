import { FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

export default function HashDisplay({ hash, label }: { hash: string, label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = `${hash.slice(0, 8)}...${hash.slice(-8)}`;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted">{label}</span>}
      <div className="flex items-center gap-2 font-mono text-xs bg-portbase border border-portmid px-2 py-1.5 rounded-lg text-color-text-secondary shadow-inner">
        <span className="truncate max-w-[150px]" title={hash}>{truncated}</span>
        <button 
          onClick={copy}
          className="hover:text-portaccent transition-colors"
        >
          {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
        </button>
      </div>
    </div>
  );
}
