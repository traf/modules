'use client';

import { useState, useEffect, useRef } from 'react';
import Code from '../components/Code';
import Input from '../components/Input';
import Tabs from '../components/Tabs';
import Dropdown from '../components/Dropdown';
import { Icon } from '@/modules/icons/src';

export default function QRPage() {
  const [data, setData] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('md');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#ffffff');
  const [selectedSpacing, setSelectedSpacing] = useState<string>('md');
  const [selectedErrorCorrection, setSelectedErrorCorrection] = useState<string>('M');
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dataInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataInputRef.current?.focus();
  }, []);

  const spacingMap: Record<string, string> = { xs: '0', sm: '1', md: '2', lg: '3', xl: '4' };

  const qrUrl = `/api/qr?url=${encodeURIComponent(data || 'modul.es')}&size=${selectedSize}&color=${encodeURIComponent(selectedColor)}&bgColor=${encodeURIComponent(selectedBgColor)}&margin=${spacingMap[selectedSpacing]}&errorCorrection=${selectedErrorCorrection}`;

  return (
    <div className="w-full h-auto lg:h-full flex flex-col lg:flex-row items-start justify-start overflow-hidden">

      {/* Left Sidebar - Controls and Code */}
      <div className="w-full lg:w-[440px] flex-shrink-0 h-auto lg:h-full flex flex-col gap-8 p-6 pb-20 lg:pb-6 border-r overflow-hidden relative">

        {/* URL */}
        <Input
          ref={dataInputRef}
          label="URL"
          placeholder="modul.es"
          prefix="https://"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        {/* Size */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Size</p>
          <Tabs
            items={[
              { id: 'xs', label: 'XS' },
              { id: 'sm', label: 'SM' },
              { id: 'md', label: 'MD' },
              { id: 'lg', label: 'LG' },
              { id: 'xl', label: 'XL' }
            ]}
            activeTab={selectedSize}
            onTabChange={setSelectedSize}
          />
        </div>

        {/* Color and Background Color */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Color"
              placeholder="#000000"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Background"
              placeholder="#ffffff"
              value={selectedBgColor}
              onChange={(e) => setSelectedBgColor(e.target.value)}
            />
          </div>
        </div>

        {/* Spacing */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Spacing</p>
          <Tabs
            items={[
              { id: 'xs', label: 'XS' },
              { id: 'sm', label: 'SM' },
              { id: 'md', label: 'MD' },
              { id: 'lg', label: 'LG' },
              { id: 'xl', label: 'XL' }
            ]}
            activeTab={selectedSpacing}
            onTabChange={setSelectedSpacing}
          />
        </div>

        {/* Error Correction */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Error Correction</p>
          <Dropdown
            items={[
              { id: 'L', label: 'Low' },
              { id: 'M', label: 'Medium' },
              { id: 'Q', label: 'Quartile' },
              { id: 'H', label: 'High' }
            ]}
            value={selectedErrorCorrection}
            onChange={setSelectedErrorCorrection}
          />
        </div>

        {/* Fixed bottom installation panel */}
        <div className="absolute gap-4 bottom-0 left-0 w-full lg:w-[440px] bg-black border-t z-50">
          <button
            onClick={() => setIsInstallOpen(!isInstallOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-900"
          >
            Installation
            <Icon
              name={isInstallOpen ? 'arrow-down-01' : 'arrow-up-01'}
              set="huge"
              color="neutral-500"
              style="sharp"
            />
          </button>

          <div
            className={`overflow-y-auto transition-all duration-200 ${isInstallOpen ? 'max-h-96' : 'max-h-0'
              }`}
          >
            <div className="p-6 pt-6 flex flex-col gap-6">
              <Code type="terminal" title="Install">{`npm install @modul-es/qr`}</Code>
              <Code title="Usage">
                {`<QR 
  url="${data || 'modul.es'}" 
  size="${selectedSize}"
  color="${selectedColor}"
  bgColor="${selectedBgColor}"
  margin={${spacingMap[selectedSpacing]}}
  errorCorrection="${selectedErrorCorrection}"
/>`}
              </Code>

              <Code title="Or use as an image URL">
                {`<img src="modul.es/api/qr?url=modul.es&size=md&color=%23000000&bgColor=%23ffffff&margin=2&errorCorrection=M" />`}
              </Code>

              <div className="flex flex-col gap-5">
                <p className="text-white">Props</p>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center justify-center bg-neutral-900 border px-2 py-1">URL</div>
                  <div className="flex flex-1 items-center justify-center bg-neutral-900 border px-2 py-1">Size</div>
                  <div className="flex flex-1 items-center justify-center bg-neutral-900 border px-2 py-1">Color</div>
                  <div className="flex flex-1 items-center justify-center bg-neutral-900 border px-2 py-1">Spacing</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Right Side - QR Code Preview */}
      <div className="w-full lg:flex-1 lg:h-full bg-black overflow-y-auto flex items-center justify-center p-12">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={qrUrl}
            alt="QR Code"
            className="w-full max-w-md"
            key={qrUrl}
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
