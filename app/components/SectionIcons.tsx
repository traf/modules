'use client';

import { useState } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';
import Code from './Code';
import Section from './Section';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'money-04', 'zap', 'victory-finger-02', 'square-lock-password'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'money', 'zap', 'heart', 'lock']
};

export default function SectionIcons() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');

  return (
    <Section id="icon" title="icon.module" description="Icon component system">

      {/* Set Selector */}
      <div className="flex -mx-2 w-full">
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

      {/* Icon Grid */}
      <div className="flex border w-full divide-x-2 divide-dashed divide-neutral-800">
        {iconSets[selectedSet as keyof typeof iconSets]?.map((iconName) => (
          <div key={`${selectedSet}-${iconName}`} className="flex items-center justify-center w-full p-6 aspect-square">
            <Icon 
              name={iconName}
              set={selectedSet as 'huge' | 'pixelart' | 'phosphor'}
              color="white"
              className="w-8"
            />
          </div>
        ))}
      </div>

      <Code>
        {`import { Icon } from '@modules/icons';

// Basic usage
<Icon set="huge" name="home-01" color="slate-400" stroke="2" />

// Phosphor icons with weight variants
<Icon set="phosphor" name="heart" style="thin" color="white" />
<Icon set="phosphor" name="heart" style="bold" color="white" />
<Icon set="phosphor" name="heart" style="fill" color="ef4444" />
<Icon set="phosphor" name="heart" style="duotone" color="fbbf24" />`}
      </Code>

    </Section>
  );
}