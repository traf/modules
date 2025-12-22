'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import JSZip from 'jszip';
import Button from '@/app/components/Button';
import Input from '@/app/components/Input';
import DetailSidebar from '@/app/components/DetailSidebar';
import PageSidebar from '@/app/components/PageSidebar';
import PageContent from '@/app/components/PageContent';
import PageLayout from '@/app/components/PageLayout';
import DividedList from '@/app/components/DividedList';
import Tabs from '@/app/components/Tabs';
import FormField from '@/app/components/FormField';
import Copy from '@/app/components/Copy';
import { Icon } from '@modules/icons';
import { saveSplitHistory, getAllSplitHistory, deleteSplitHistory, SplitHistory } from '@/app/lib/storage';

interface SplitImage {
  url: string;
  width: number;
  height: number;
}

export default function MediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [splits, setSplits] = useState<SplitImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SplitHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<SplitHistory | null>(null);
  const [gridSize, setGridSize] = useState({ cols: 3, rows: 3 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [frameBorder, setFrameBorder] = useState(4);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const allHistory = await getAllSplitHistory();
      setHistory(allHistory);
      if (allHistory.length > 0 && !selectedHistory) {
        const latest = allHistory[0];
        setSelectedHistory(latest);
        setPreview(latest.originalImage);
        setSplits(latest.splits);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            const img = document.createElement('img');
            img.onload = () => {
              const isLandscape = img.width >= img.height;
              setImageDimensions({ width: img.width, height: img.height });
              if (!isLandscape && gridSize.cols > gridSize.rows) {
                setGridSize({ cols: gridSize.rows, rows: gridSize.cols });
              } else if (isLandscape && gridSize.rows > gridSize.cols) {
                setGridSize({ cols: gridSize.rows, rows: gridSize.cols });
              }
            };
            img.src = url;
            setFile(file);
            setPreview(url);
            setSplits([]);
            setError(null);
            setSelectedHistory(null);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [gridSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const img = document.createElement('img');
      img.onload = () => {
        const isLandscape = img.width >= img.height;
        setImageDimensions({ width: img.width, height: img.height });
        if (!isLandscape && gridSize.cols > gridSize.rows) {
          setGridSize({ cols: gridSize.rows, rows: gridSize.cols });
        } else if (isLandscape && gridSize.rows > gridSize.cols) {
          setGridSize({ cols: gridSize.rows, rows: gridSize.cols });
        }
      };
      img.src = url;
      setFile(selectedFile);
      setPreview(url);
      setSplits([]);
      setError(null);
      setSelectedHistory(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSplits([]);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('cols', gridSize.cols.toString());
    formData.append('rows', gridSize.rows.toString());
    formData.append('frameBorder', frameBorder.toString());

    try {
      const response = await fetch('/api/split', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to split image');
      }

      const data = await response.json();
      setSplits(data.images);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalImageDataUrl = reader.result as string;

        const historyEntry: SplitHistory = {
          id: `split-${Date.now()}`,
          timestamp: Date.now(),
          originalImage: originalImageDataUrl,
          filename: file.name,
          splits: data.images,
        };

        await saveSplitHistory(historyEntry);
        await loadHistory();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${index + 1}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setSplits([]);
    setError(null);
    setSelectedHistory(null);
  };

  const handleHistoryClick = (item: SplitHistory) => {
    setSelectedHistory(item);
    setPreview(item.originalImage);
    setSplits(item.splits);
    setFile(null);
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const wasSelected = selectedHistory?.id === id;
      const currentIndex = history.findIndex(item => item.id === id);
      
      await deleteSplitHistory(id);
      const updatedHistory = await getAllSplitHistory();
      setHistory(updatedHistory);
      
      if (wasSelected && updatedHistory.length > 0) {
        const nextItem = updatedHistory[currentIndex] || updatedHistory[currentIndex - 1] || updatedHistory[0];
        setSelectedHistory(nextItem);
        setPreview(nextItem.originalImage);
        setSplits(nextItem.splits);
      } else if (wasSelected) {
        setSelectedHistory(null);
        setPreview(null);
        setSplits([]);
      }
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

  const handleDownloadAll = async (item: SplitHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const zip = new JSZip();

      for (let i = 0; i < item.splits.length; i++) {
        const response = await fetch(item.splits[i].url);
        const blob = await response.blob();
        zip.file(`${i + 1}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download all images:', err);
    }
  };

  return (
    <PageLayout>
      <PageSidebar>
        <FormField title="Upload image" subtitle="JPG, PNG, WEBP">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="file-input"
            placeholder="Click to upload or paste an image from your clipboard"
          />
        </FormField>

        <FormField title="Grid Size">
          <Tabs
            items={[
              { id: '2x2', label: '2×2' },
              { id: '3x3', label: '3×3' },
              { id: '4x4', label: '4×4' },
            ]}
            activeTab={`${gridSize.cols}x${gridSize.rows}`}
            onTabChange={(id) => {
              const [cols, rows] = id.split('x').map(Number);
              setGridSize({ cols, rows });
            }}
          />
        </FormField>

        <FormField title="Border size">
          <Tabs
            items={[
              { id: '4', label: 'XS' },
              { id: '8', label: 'SM' },
              { id: '12', label: 'MD' },
              { id: '18', label: 'LG' },
              { id: '28', label: 'XL' },
            ]}
            activeTab={frameBorder.toString()}
            onTabChange={(id) => setFrameBorder(Number(id))}
          />
        </FormField>

        <Button onClick={handleSplit} disabled={loading} variant="full">
          {loading ? 'Splitting...' : 'Split Image'}
        </Button>

        {error && (
          <div className="border border-red-500 p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </PageSidebar>

      <PageContent>
        <div className="p-9">
          {preview && !splits.length && imageDimensions && (
            <div className="relative max-w-full max-h-full border" style={{ aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`, height: '100%', width: 'auto' }}>
              <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`} preserveAspectRatio="none">
                {Array.from({ length: gridSize.rows - 1 }).map((_, i) => {
                  const frameHeight = Math.floor(imageDimensions.height / gridSize.rows);
                  const y = (i + 1) * frameHeight;
                  const cropStart = y - frameBorder;
                  const cropEnd = y + frameBorder;
                  
                  return (
                    <rect
                      key={`h-${i}`}
                      x="0"
                      y={cropStart}
                      width={imageDimensions.width}
                      height={frameBorder * 2}
                      fill="rgb(255, 0, 0)"
                      stroke="#ff0000"
                      strokeWidth="1"
                      strokeDasharray="8 4"
                    />
                  );
                })}
                {Array.from({ length: gridSize.cols - 1 }).map((_, i) => {
                  const frameWidth = Math.floor(imageDimensions.width / gridSize.cols);
                  const x = (i + 1) * frameWidth;
                  const cropStart = x - frameBorder;
                  const cropEnd = x + frameBorder;
                  
                  return (
                    <rect
                      key={`v-${i}`}
                      x={cropStart}
                      y="0"
                      width={frameBorder * 2}
                      height={imageDimensions.height}
                      fill="rgb(255, 0, 0)"
                      stroke="#ff0000"
                      strokeWidth="1"
                      strokeDasharray="8 4"
                    />
                  );
                })}
              </svg>
            </div>
          )}

          {splits.length > 0 && (
            <div className="w-full grid grid-cols-2 gap-6">
              {splits.map((split, index) => (
                <div key={index} className="border">
                  <Image src={split.url} alt={`Split ${index + 1}`} className="w-full h-auto" width={split.width} height={split.height} unoptimized />
                  <div className="p-3 flex items-center justify-between border-t">
                    <div className="flex flex-col items-start ml-1">
                      <p className="text-white">{index + 1}/{splits.length}</p>
                      <p>{split.width} × {split.height}</p>
                    </div>
                    <div className="flex items-center scale-90 -space-x-1">
                      <Button onClick={() => handleDownload(split.url, index)} variant="icon">
                        <Icon set="pixelart" name="download" color="white" className="group-hover:invert" />
                      </Button>
                      <Copy imageUrl={split.url} size="md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContent>

      {history.length > 0 && (
        <DetailSidebar isOpen={history.length > 0} title="History" showClose={false}>
          {history.length > 0 && (
            <DividedList>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className={`w-full p-6 flex items-center justify-between hover:bg-white/5 cursor-pointer ${selectedHistory?.id === item.id ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 border overflow-hidden flex-shrink-0">
                      <Image src={item.originalImage} alt="Thumbnail" className="w-full h-full object-cover" width={48} height={48} unoptimized />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-white text-sm">{item.filename || `image`}</span>
                      <span className="text-grey text-xs">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      onClick={(e) => e && handleDownloadAll(item, e)}
                      variant="icon"
                      className="flex-shrink-0"
                    >
                      <Icon set="lucide" name="download" size="sm" />
                    </Button>
                    <Button
                      onClick={(e) => e && handleDeleteHistory(item.id, e)}
                      variant="icon"
                      className="flex-shrink-0"
                    >
                      <Icon set="lucide" name="trash-2" size="sm" />
                    </Button>
                  </div>
                </div>
              ))}
            </DividedList>
          )}
        </DetailSidebar>
      )}
    </PageLayout>
  );
}
