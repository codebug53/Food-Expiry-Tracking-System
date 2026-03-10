import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import VerdictCard from '../components/VerdictCard';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanResult = location.state?.scanResult;

  if (!scanResult) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No Result Found</h2>
        <p className="text-muted-foreground mb-8">Please scan a product first.</p>
        <button onClick={() => navigate('/scan')} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium">
          Go to Scan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-heading font-bold mb-2">Scan Result</h2>
        {scanResult.no_date_found && (
          <p className="text-destructive font-medium bg-destructive/10 inline-block px-3 py-1 rounded-full text-sm mt-2">
            No valid date format could be read from the label.
          </p>
        )}
      </div>

      {!scanResult.no_date_found ? (
        <VerdictCard 
          verdict={scanResult.verdict}
          daysRemaining={scanResult.days_remaining}
          expiryDate={scanResult.expiry_date}
          productName={scanResult.product_name}
        />
      ) : (
        <div className="p-6 bg-muted border rounded-xl text-center space-y-4">
          <h3 className="text-xl font-bold">Manual Entry Required</h3>
          <p className="text-sm text-muted-foreground">The AI extracted the following text, but couldn't confidently find a date:</p>
          <div className="bg-background border rounded-md p-3 text-left">
            <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {scanResult.raw_text || "No text detected."}
            </p>
          </div>
          <div className="pt-4 text-sm text-muted-foreground">
            Feature to manually pick a date is under development.
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center mt-8">
        <button onClick={() => navigate('/scan')} className="border border-input bg-background hover:bg-accent px-6 py-2 rounded-md font-medium">
          Scan Another
        </button>
        <button onClick={() => navigate('/history')} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium">
          View History
        </button>
      </div>
    </div>
  );
}
