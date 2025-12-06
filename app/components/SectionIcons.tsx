'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';
import Code from './Code';
import Section from './Section';
import Loader from './Loader';

export default function SectionIcons() {
  const [iconSets, setIconSets] = useState<Record<string, string[]>>({});
  const [selectedSet, setSelectedSet] = useState<string>('huge');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIconSets = async () => {
      try {
        const response = await fetch('/api/icons');
        const data = await response.json();
        setIconSets(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch icon sets:', error);
        setLoading(false);
      }
    };

    fetchIconSets();
  }, []);

  return (
    <Section id="icon" title="icon.module" description="Icon component system">

      {/* Set Selector */}
      <div className="flex -mx-2 w-full">
        {loading ? (
          // Show placeholder buttons while loading
          ['huge', 'phosphor', 'pixelart'].map(setName => (
            <Button
              key={setName}
              onClick={() => { }}
              variant="ghost"
              disabled
            >
              {setName}
            </Button>
          ))
        ) : (
          Object.keys(iconSets).map(setName => (
            <Button
              key={setName}
              onClick={() => setSelectedSet(setName)}
              variant={selectedSet === setName ? 'primary' : 'ghost'}
            >
              {setName}
            </Button>
          ))
        )}
      </div>

      {/* Icon Grid */}
      <div className="flex border w-full divide-x-2 divide-dashed divide-neutral-800">
        {loading ? (
          // Initial loading
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center w-full p-6 aspect-square">
              <Loader />
            </div>
          ))
        ) : selectedSet && iconSets[selectedSet] ? (
          // Show icons
          iconSets[selectedSet].map((iconName) => (
            <div key={`${selectedSet}-${iconName}`} className="flex items-center justify-center w-full p-6 aspect-square">
              <Icon 
                name={iconName}
                set={selectedSet as 'huge' | 'pixelart' | 'phosphor'}
                color="white"
                className="w-8"
              />
            </div>
          ))
        ) : null}
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