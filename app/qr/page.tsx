'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Code from '../components/Code';
import Input from '../components/Input';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import PageContent from '../components/PageContent';
import PageSidebar from '../components/PageSidebar';
import PageLayout from '../components/PageLayout';
import Section from '../components/Section';

export default function QRClient() {
  const [data, setData] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('md');
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [selectedBgColor, setSelectedBgColor] = useState<string>('white');
  const [selectedSpacing, setSelectedSpacing] = useState<string>('md');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataInputRef.current?.focus();
  }, []);

  const spacingMap: Record<string, string> = { sm: '1', md: '2', lg: '3' };
  const sizeMap: Record<string, number> = { sm: 256, md: 384, lg: 512 };

  const qrUrl = `/api/qr?url=${encodeURIComponent(data || 'modul.es')}&size=${selectedSize}&color=${encodeURIComponent(selectedColor.replace('#', ''))}&bgColor=${encodeURIComponent(selectedBgColor.replace('#', ''))}&margin=${spacingMap[selectedSpacing]}`;
  const hostedUrl = `https://modul.es${qrUrl}`;

  useEffect(() => {
    const loadQr = async () => {
      setIsLoading(true);
      try {
        const fetchUrl = `${qrUrl}&_t=${Date.now()}`;
        const response = await fetch(fetchUrl, { cache: 'no-store' });
        if (response.ok) {
          const svg = await response.text();
          setQrSvg(svg);
        }
      } catch (error) {
        console.error('Failed to load QR:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQr();
  }, [qrUrl, selectedSize]);

  const svgToPng = useCallback(async (): Promise<Blob> => {
    const size = sizeMap[selectedSize] || 384;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    const img = new Image();
    const svgBlob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PNG'));
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  }, [qrSvg, selectedSize, sizeMap]);

  const handleCopy = async (format: string) => {
    try {
      if (format === 'svg') {
        await navigator.clipboard.writeText(qrSvg);
      } else if (format === 'png') {
        const blob = await svgToPng();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else if (format === 'url') {
        await navigator.clipboard.writeText(hostedUrl);
      }
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownload = async (format: string) => {
    try {
      if (format === 'svg') {
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${data || 'modul.es'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'png') {
        const blob = await svgToPng();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${data || 'modul.es'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setDownloadedFormat(format);
      setTimeout(() => setDownloadedFormat(null), 2000);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <PageLayout>
      <PageSidebar
        size="lg"
        footer={
          <>
            <Code type="terminal" title="Install">{`npm install @modul-es/qr`}</Code>
            <Code title="Usage">
              {`<QR 
  url="${data || 'modul.es'}" 
  size="${selectedSize}"
  color="${selectedColor}"
  bgColor="${selectedBgColor}"
  margin={${spacingMap[selectedSpacing]}}
/>`}
            </Code>

            <Code title="Or use as an image URL">
              {`<img src="modul.es${qrUrl}" />`}
            </Code>

            <div className="flex flex-col gap-5">
              <p className="text-white">Props</p>
              <div className="flex gap-2">
                <Badge className="flex-1 border">URL</Badge>
                <Badge className="flex-1 border">Size</Badge>
                <Badge className="flex-1 border">Color</Badge>
                <Badge className="flex-1 border">Spacing</Badge>
              </div>
            </div>
          </>
        }
      >
        <Input
          ref={dataInputRef}
          label="URL"
          placeholder="modul.es"
          prefix="https://"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <Section label="Size">
          <Tabs
            items={[
              { id: 'sm', label: 'SM' },
              { id: 'md', label: 'MD' },
              { id: 'lg', label: 'LG' }
            ]}
            activeTab={selectedSize}
            onTabChange={setSelectedSize}
          />
        </Section>

        <Section label="Spacing">
          <Tabs
            items={[
              { id: 'sm', label: 'SM' },
              { id: 'md', label: 'MD' },
              { id: 'lg', label: 'LG' }
            ]}
            activeTab={selectedSpacing}
            onTabChange={setSelectedSpacing}
          />
        </Section>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Color"
              placeholder="black, sky-600"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Background"
              placeholder="white, neutral-100"
              value={selectedBgColor}
              onChange={(e) => setSelectedBgColor(e.target.value)}
            />
          </div>
        </div>

        <Section label="Copy">
          <Tabs
            items={[
              { id: 'svg', label: copiedFormat === 'svg' ? 'Copied' : 'SVG' },
              { id: 'png', label: copiedFormat === 'png' ? 'Copied' : 'PNG' },
              { id: 'url', label: copiedFormat === 'url' ? 'Copied' : 'URL' }
            ]}
            activeTab={copiedFormat || ''}
            onTabChange={handleCopy}
          />
        </Section>

        <Section label="Download">
          <Tabs
            items={[
              { id: 'svg', label: downloadedFormat === 'svg' ? 'Done' : 'SVG' },
              { id: 'png', label: downloadedFormat === 'png' ? 'Done' : 'PNG' }
            ]}
            activeTab={downloadedFormat || ''}
            onTabChange={handleDownload}
          />
        </Section>
      </PageSidebar>

      <PageContent className="flex items-center justify-center p-12">
        {isLoading ? (
          <Loader />
        ) : (
          <div 
            className="[&>svg]:block"
            dangerouslySetInnerHTML={{ __html: qrSvg }} 
          />
        )}
      </PageContent>
    </PageLayout>
  );
}
