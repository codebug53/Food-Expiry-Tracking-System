import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

export default function Scan() {
  const [image, setImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useEsp32, setUseEsp32] = useState(false);
  const [esp32Url, setEsp32Url] = useState('http://172.27.117.66:81/stream');
  
  const webcamRef = useRef(null);
  const esp32ImgRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleCapture = useCallback(() => {
    if (useEsp32 && esp32ImgRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = esp32ImgRef.current.naturalWidth || 640;
        canvas.height = esp32ImgRef.current.naturalHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(esp32ImgRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setIsCapturing(false);
      } catch (err) {
        toast.error('Could not capture from ESP32 stream (CORS issue).');
        console.error(err);
      }
    } else if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        setIsCapturing(false);
      }
    }
  }, [webcamRef, useEsp32]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress image and automatically apply EXIF rotation
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          exifOrientation: true // Address the EXIF rotation backlog item
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        toast.error('Error processing image');
        console.error(error);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileChange({ target: { files: [file] } });
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: image.split(',')[1],
          product_name: productName
        })
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to analyze image');
        return;
      }

      // Add to history if success and not "no date found"
      if (!data.no_date_found && data.expiry_date) {
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          product_name: data.product_name || 'Unknown Product',
          expiry_date: data.expiry_date,
          verdict: data.verdict,
          days_remaining: data.days_remaining
        };
        const evt = localStorage.getItem('pantry_history');
        const history = evt ? JSON.parse(evt) : [];
        localStorage.setItem('pantry_history', JSON.stringify([historyItem, ...history]));
      }

      navigate('/result', { state: { scanResult: data } });

    } catch (error) {
      toast.error('Network error during scanning');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-heading font-bold mb-2">Scan Product Label</h2>
        <p className="text-muted-foreground">Upload or take a photo of the expiry date</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Tomato Soup"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden mt-4">
          {!image && !isCapturing ? (
            <div 
              className="p-12 text-center border-dashed border-2 m-4 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground">SVG, PNG, JPG or WEBP</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : isCapturing ? (
            <div className="relative bg-black rounded-lg overflow-hidden flex flex-col items-center">
              {useEsp32 && (
                <div className="absolute top-0 left-0 right-0 p-2 z-10 bg-gradient-to-b from-black/80 to-transparent">
                  <input 
                    type="text" 
                    value={esp32Url} 
                    onChange={e => setEsp32Url(e.target.value)} 
                    className="w-full h-8 rounded border border-white/20 bg-black/50 text-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="ESP32 Stream URL" 
                  />
                </div>
              )}
              {useEsp32 ? (
                <img 
                  ref={esp32ImgRef} 
                  src={esp32Url} 
                  crossOrigin="anonymous" 
                  className="w-full h-auto max-h-[400px] object-contain" 
                  alt="ESP32 Stream" 
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full h-auto max-h-[400px] object-cover"
                  data-testid="camera-video"
                />
              )}
              <button 
                onClick={() => setIsCapturing(false)}
                className="absolute top-12 right-2 bg-black/50 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-black/70 transition-colors z-10"
              >
                Cancel
              </button>
              <button 
                onClick={handleCapture}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black font-bold rounded-full h-14 w-14 flex items-center justify-center border-4 border-primary/20 hover:scale-105 transition-transform z-10"
              >
                Snap
              </button>
            </div>
          ) : (
            <div className="relative">
              <img src={image} alt="Product label" className="w-full h-auto max-h-[400px] object-contain bg-background" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-md px-3 py-1 text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {!isCapturing && !image && (
          <div className="flex gap-2 w-full mt-4">
            <button 
              onClick={() => { setIsCapturing(true); setUseEsp32(false); }}
              className="flex-1 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors font-medium text-sm"
            >
              Device Camera
            </button>
            <button 
              onClick={() => { setIsCapturing(true); setUseEsp32(true); }}
              className="flex-1 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors font-medium text-sm"
            >
              ESP32 Camera
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!image || loading}
        className="w-full flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-12 px-8 font-medium text-lg transition-colors shadow-sm"
      >
        {loading ? 'Analyzing...' : 'Analyze Label'}
      </button>

    </div>
  );
}
