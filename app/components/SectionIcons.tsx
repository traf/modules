'use client';

import { useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';
import Code from './Code';
import Section from './Section';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'dollar-02', 'zap', 'victory-finger-02', 'square-lock-password'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'dollar', 'zap', 'heart', 'lock'],
  lucide: ['house', 'activity', 'pencil', 'folder', 'qr-code', 'monitor', 'circle-check', 'message-circle', 'dollar-sign', 'zap', 'heart', 'lock']
};

export default function SectionIcons() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');

  return (
    <Section id="icon" title="icon.module" description="Icon component system" className="!pb-40">

      {/* Icon Grid */}
      <div className="grid grid-cols-4 lg:flex border w-full divide-y-2 lg:divide-y-0 divide-x-2 divide-dashed divide-neutral-800">
        {iconSets[selectedSet as keyof typeof iconSets]?.map((iconName) => (
          <div key={`${selectedSet}-${iconName}`} className="flex items-center justify-center w-full p-6 aspect-square">
            <Icon
              name={iconName}
              set={selectedSet as 'huge' | 'pixelart' | 'phosphor' | 'lucide'}
              color="white"
              className="w-8"
            />
          </div>
        ))}
      </div>

      {/* Set Selector */}
      <div className="flex -mx-1.5 w-full">
        {Object.keys(iconSets).map(setName => (
          <Button
            key={setName}
            onClick={() => setSelectedSet(setName)}
            variant={selectedSet === setName ? 'primary' : 'ghost'}
          >
            {setName}
          </Button>
        ))}
      </div>

      <Code>
        {
          `import { Icon } from '@modul-es/icons';

<Icon set="${selectedSet}" name="home-01" color="white" stroke="1.5" />

`}
      </Code>

    </Section>
  );
}