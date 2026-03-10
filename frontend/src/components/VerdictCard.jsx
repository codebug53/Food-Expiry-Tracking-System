import React from 'react';

export default function VerdictCard({ verdict, daysRemaining, expiryDate, productName }) {
  let bgColor = 'bg-muted';
  let textColor = 'text-muted-foreground';
  let borderColor = 'border-muted';
  let title = 'Unknown Status';
  let description = 'Could not determine safety.';

  if (verdict === 'SAFE') {
    bgColor = 'bg-primary/20';
    textColor = 'text-primary';
    borderColor = 'border-primary/30';
    title = 'Safe to Consume';
    description = `You have ${daysRemaining} days left.`;
  } else if (verdict === 'CONSUME SOON') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-500/30';
    title = 'Consume Soon';
    description = `Only ${daysRemaining} days left. Plan to use soon.`;
  } else if (verdict === 'RISKY') {
    bgColor = 'bg-orange-500/20';
    textColor = 'text-orange-700';
    borderColor = 'border-orange-500/30';
    title = 'Risky';
    description = `Expires very soon (${daysRemaining} days). Inspect before use.`;
  } else if (verdict === 'EXPIRED') {
    bgColor = 'bg-destructive/20';
    textColor = 'text-destructive';
    borderColor = 'border-destructive/30';
    title = 'Expired';
    description = `Expired ${Math.abs(daysRemaining)} days ago. Do not consume.`;
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${bgColor} ${borderColor} shadow-sm text-center max-w-sm mx-auto`}>
      <h3 className={`text-2xl font-bold font-heading mb-2 ${textColor}`}>{title}</h3>
      <p className="text-foreground font-medium mb-1">{description}</p>
      
      {productName && (
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
          <p className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold">Product</p>
          <p className="font-medium text-lg">{productName}</p>
        </div>
      )}

      {expiryDate && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider text-xs font-bold">Expiry Date</p>
          <p className="font-mono text-lg">{expiryDate}</p>
        </div>
      )}
    </div>
  );
}
