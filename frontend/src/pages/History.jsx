import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('pantry_history');
    if (data) {
      setHistory(JSON.parse(data));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('pantry_history');
    setHistory([]);
    toast.success('History cleared');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold mb-1">Scan History</h2>
          <p className="text-muted-foreground">Recent products you have checked.</p>
        </div>
        
        {/* FIX: Make Clear History button visible even in empty state as recommended */}
        <button 
          data-testid="clear-history-btn"
          onClick={clearHistory}
          disabled={history.length === 0}
          className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors text-sm"
        >
          Clear History
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card text-muted-foreground">
          <p className="text-lg font-medium">No history found</p>
          <p className="text-sm">Scan a product and it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item.id} className="p-5 bg-card border rounded-xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg truncate pr-2" title={item.product_name}>{item.product_name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                  item.verdict === 'SAFE' ? 'bg-primary/20 text-primary' :
                  item.verdict === 'CONSUME SOON' ? 'bg-yellow-500/20 text-yellow-700' :
                  item.verdict === 'RISKY' ? 'bg-orange-500/20 text-orange-700' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {item.verdict}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground flex justify-between">
                  <span className="text-muted-foreground">Expiry:</span> <span className="font-mono">{item.expiry_date}</span>
                </p>
                <p className="text-sm text-foreground flex justify-between">
                  <span className="text-muted-foreground">Expires in:</span> <span>{item.days_remaining} days</span>
                </p>
                <p className="text-xs text-muted-foreground pt-2 border-t mt-2">
                  Scanned: {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
