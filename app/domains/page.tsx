'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '../components/Input';
import { Icon } from '@modules/icons';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { formatPrice, formatDate } from '../lib/utils';

interface DomainResult {
  domain: string;
  subdomain: string;
  zone: string;
  path?: string;
  registerURL?: string;
}

interface DomainStatus {
  domain: string;
  status: string;
  zone: string;
  tags?: string;
  offers?: Array<{
    currency: string;
    price: string;
    vendor: string;
  }>;
}

interface Registrar {
  name: string;
  url: string;
}

interface WhoisData {
  domain?: string;
  registrar?: string;
  created_date?: string;
  expiration_date?: string;
  updated_date?: string;
  name_servers?: string[];
  status?: string[];
  registrant_organization?: string;
}

function DomainsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [statuses, setStatuses] = useState<Record<string, DomainStatus>>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<DomainResult | null>(null);
  const [registrars, setRegistrars] = useState<Registrar[]>([]);
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [isLoadingWhois, setIsLoadingWhois] = useState<boolean>(false);
  const [whoisError, setWhoisError] = useState<boolean>(false);
  const [skeletonCount, setSkeletonCount] = useState<number>(12);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setStatuses({});

    try {
      // Check if query already looks like a complete domain (contains a dot)
      const isCompleteDomain = query.includes('.');
      
      // Extract the base name (subdomain part before first dot if complete domain, otherwise the whole query)
      const baseName = isCompleteDomain ? query.split('.')[0] : query;
      
      const commonTLDs = [
        // 2-letter
        'ae', 'af', 'ai', 'be', 'cc', 'co', 'es', 'fi', 'fm', 'gg', 'im', 'io', 'is', 'me', 're', 'sh',
        // 3-letter
        'app', 'art', 'bio', 'com', 'dev', 'fun', 'fyi', 'net', 'one', 'xyz',
        // 4+ letters
        'agency', 'black', 'blog', 'cafe', 'cash', 'chat', 'cloud', 'computer', 'design', 'digital', 'directory', 'game', 'games', 'link', 'money', 'network', 'page', 'pizza', 'shop', 'site', 'space', 'store', 'studio', 'tech', 'website', 'world'
      ];
      const commonDomains: DomainResult[] = commonTLDs.map(tld => ({
        domain: `${baseName.toLowerCase()}.${tld}`,
        subdomain: baseName.toLowerCase(),
        zone: tld,
        registerURL: `https://www.namecheap.com/domains/registration/results/?domain=${baseName.toLowerCase()}.${tld}`
      }));

      let fastlyDomains: DomainResult[] = [];
      try {
        const res = await fetch(`/api/domains/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          fastlyDomains = (data.results || data.domains || data || [])
            .filter((d: DomainResult) => /^[a-z0-9.-]+$/i.test(d.domain))
            .filter((d: DomainResult) => !d.domain.endsWith('.quebec'))
            .filter((d: DomainResult) => d.subdomain && d.subdomain.length > 0)
            .filter((d: DomainResult) => {
              // If searching for a complete domain, filter out double TLD results
              // e.g., searching "swish.dev" should not show "swish.dev.be"
              if (isCompleteDomain) {
                const parts = d.domain.split('.');
                // Only show domains with 2 parts (name.tld), not 3+ parts (name.tld.tld2)
                return parts.length === 2;
              }
              return true;
            });
        }
      } catch (error) {
        console.error('Fastly API unavailable, showing common TLDs only:', error);
      }

      const allDomains = [...commonDomains, ...fastlyDomains];
      const uniqueDomains = Array.from(new Map(allDomains.map((d: DomainResult) => [d.domain, d])).values());
      
      // Sort: exact matches (including domain hacks) first, then priority TLDs, then by TLD length, then alphabetically
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, '');
      const priorityTLDs = ['com', 'co', 'io'];
      
      uniqueDomains.sort((a, b) => {
        // Check if domain exactly matches query
        const isExactA = a.domain === normalizedQuery || a.domain === query.toLowerCase();
        const isExactB = b.domain === normalizedQuery || b.domain === query.toLowerCase();
        
        // Check if subdomain + zone forms the query (domain hack)
        // Strip trailing dot from subdomain before concatenating
        const isDomainHackA = (a.subdomain.replace(/\.$/, '') + a.zone) === normalizedQuery;
        const isDomainHackB = (b.subdomain.replace(/\.$/, '') + b.zone) === normalizedQuery;
        
        const isMatchA = isExactA || isDomainHackA;
        const isMatchB = isExactB || isDomainHackB;
        
        if (isMatchA && !isMatchB) return -1;
        if (!isMatchA && isMatchB) return 1;
        
        // Both are exact matches or both are not, check priority TLDs
        const isPriorityA = priorityTLDs.includes(a.zone);
        const isPriorityB = priorityTLDs.includes(b.zone);
        
        if (isPriorityA && !isPriorityB) return -1;
        if (!isPriorityA && isPriorityB) return 1;
        
        // Both priority or both not priority, sort by TLD length
        const tldLenA = a.zone.length;
        const tldLenB = b.zone.length;
        
        if (tldLenA !== tldLenB) return tldLenA - tldLenB;
        
        return a.zone.localeCompare(b.zone);
      });

      // Show results immediately
      setResults(uniqueDomains);
      setIsSearching(false);

      // Fetch statuses progressively in background
      uniqueDomains.forEach(async (result: DomainResult) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const statusRes = await fetch(`/api/domains/status?domain=${encodeURIComponent(result.domain)}`, {
            signal: controller.signal
          });
          clearTimeout(timeout);

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setStatuses(prev => ({ ...prev, [result.domain]: statusData }));
          } else {
            // API returned error, set fallback status
            setStatuses(prev => ({ ...prev, [result.domain]: { domain: result.domain, status: 'unknown', zone: result.zone } }));
          }
        } catch {
          // Network error or timeout, set fallback status
          setStatuses(prev => ({ ...prev, [result.domain]: { domain: result.domain, status: 'unknown', zone: result.zone } }));
        }
      });
    } catch (error) {
      console.error('Domain search failed:', error);
      setResults([]);
      setIsSearching(false);
    }
  }, [query]);

  useEffect(() => {
    searchInputRef.current?.focus();

    const calculateSkeletonCount = () => {
      const rowHeight = 84;
      const viewportHeight = window.innerHeight;
      const count = Math.ceil(viewportHeight / rowHeight);
      setSkeletonCount(count);
    };

    calculateSkeletonCount();
    window.addEventListener('resize', calculateSkeletonCount);
    return () => window.removeEventListener('resize', calculateSkeletonCount);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDomain) {
        setSelectedDomain(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedDomain]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!query.trim()) {
      router.push('/domains');
      setResults([]);
      setStatuses({});
      return;
    }

    router.push(`/domains?q=${encodeURIComponent(query)}`);
    debounceTimerRef.current = setTimeout(handleSearch, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, handleSearch, router]);

  const handleDomainClick = async (domain: DomainResult) => {
    setSelectedDomain(domain);
    setRegistrars([]);
    setWhoisData(null);
    setWhoisError(false);

    const status = statuses[domain.domain];
    const isAvailable = status?.status?.includes('inactive');
    const hasPricing = status?.offers && status.offers.length > 0;

    if (isAvailable || hasPricing) {
      const baseRegistrars = [
        { name: 'GoDaddy', url: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain.domain}` },
        { name: 'Namecheap', url: `https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}` },
      ];

      const additionalRegistrars = [
        { name: 'Cloudflare', url: `https://domains.cloudflare.com/?domain=${domain.domain}` },
        { name: 'IWantMyName', url: `https://iwantmyname.com/cart?domains=${domain.domain}` },
        { name: 'Vercel', url: `https://vercel.com/domains/search?q=${domain.domain}` },
      ];

      setRegistrars(hasPricing ? baseRegistrars : [...baseRegistrars, ...additionalRegistrars]);
    }

    setIsLoadingWhois(true);
    try {
      const whoisRes = await fetch(`/api/domains/whois?domain=${encodeURIComponent(domain.domain)}`);
      if (whoisRes.ok) {
        setWhoisData(await whoisRes.json());
      } else {
        setWhoisError(true);
      }
    } catch (error) {
      console.error('WHOIS lookup failed:', error);
      setWhoisError(true);
    } finally {
      setIsLoadingWhois(false);
    }
  };

  const selectedStatus = selectedDomain ? statuses[selectedDomain.domain] : null;
  const isSelectedAvailable = selectedStatus?.status?.includes('inactive');
  const isSelectedForSale = selectedStatus?.status?.includes('marketed') || selectedStatus?.status?.includes('parked');
  const isSelectedMarketed = selectedStatus?.status?.includes('marketed');

  const renderPurchaseButtons = (buttons: Registrar[]) => (
    <div className="flex flex-col gap-4">
      <p className="text-white">Purchase</p>
      <div className="border flex flex-col">
        {buttons.map((button, index) => (
          <Button
            key={index}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="w-full"
            innerClassName="w-full flex justify-between !py-2 !px-3"
          >
            {button.name}
            <Icon set="lucide" name="arrow-up-right" size="sm" className="relative top-0.5" />
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-auto lg:h-full flex flex-col lg:flex-row items-start justify-start overflow-hidden">

      {/* Left Sidebar - Search */}
      <div className="w-full lg:w-96 flex-shrink-0 h-auto lg:h-full flex flex-col gap-8 p-6 pb-20 lg:pb-6 border-r overflow-y-auto scrollbar-hide">

        {/* Search */}
        <Input
          ref={searchInputRef}
          label="Search"
          placeholder="modul.es, idea.sh, swish.dev..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Status Filter */}
        <div className="flex flex-col gap-4">
          <p className="text-white">Status</p>
          <Tabs
            items={[
              { id: 'all', label: 'All' },
              { id: 'available', label: 'Available' },
              { id: 'forsale', label: 'For sale' }
            ]}
            activeTab={statusFilter}
            onTabChange={setStatusFilter}
          />
        </div>

      </div>

      {/* Main content */}
      <div className={`w-full lg:flex-1 lg:h-full bg-black scrollbar-hide ${results.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {results.length > 0 ? (
          <div className="flex flex-col divide-y-2 divide-dashed divide-neutral-800 border-b">
            {results.filter((result) => {
              if (statusFilter === 'all') return true;

              const status = statuses[result.domain];
              if (!status) return false;

              if (statusFilter === 'available') {
                return status.status?.includes('inactive');
              }

              if (statusFilter === 'forsale') {
                return (
                  status.offers && status.offers.length > 0 ||
                  status.status?.includes('marketed') ||
                  status.status?.includes('priced')
                );
              }

              return true;
            }).map((result, index) => {
              const status = statuses[result.domain];
              const isAvailable = status?.status?.includes('inactive');
              const isPremium = status?.status?.includes('premium');

              return (
                <button
                  key={index}
                  onClick={() => handleDomainClick(result)}
                  className={`w-full p-6 h-21 flex items-center justify-between hover:bg-white/5 cursor-pointer ${selectedDomain?.domain === result.domain ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 ${!status ? 'bg-neutral-900 animate-pulse' : isAvailable ? 'bg-green-500' : 'bg-neutral-600'}`} />
                    <span className="text-white">{result.domain}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPremium && <Badge variant="purple">Premium</Badge>}
                    {!status ? (
                      <div className="w-20 h-3 bg-neutral-900 animate-pulse" />
                    ) : isAvailable ? (
                      <Badge variant="green">Available</Badge>
                    ) : status?.status?.includes('marketed') ? (
                      <Badge variant="blue">For Sale</Badge>
                    ) : status?.status?.includes('parked') ? (
                      <Badge variant="yellow">Parked</Badge>
                    ) : (
                      <Badge>Unavailable</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col divide-y-2 divide-dashed divide-neutral-800">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="w-full p-6 h-21 flex items-center justify-between">
                <div className={`flex items-center gap-4 ${isSearching ? 'animate-pulse' : ''}`}>
                  <div className="w-1.5 h-1.5 bg-neutral-900" />
                  <div className="w-32 h-3 bg-neutral-900" />
                </div>
                <div className={`flex items-center gap-2 ${isSearching ? 'animate-pulse' : ''}`}>
                  <div className="w-20 h-3 bg-neutral-900" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Domain Details */}
      <div ref={sidebarRef} className={`w-full lg:w-96 flex-shrink-0 h-auto lg:h-full flex flex-col gap-7 pb-8 border-l overflow-y-auto transition-all ${selectedDomain ? 'mr-0' : '-mr-96 lg:-mr-96'}`}>

        <div className="w-full flex items-center justify-between sticky top-0 bg-black h-21 flex-shrink-0 z-10 px-6 border-b transition-all">
          <h2>{selectedDomain?.domain || ''}</h2>
          <Button onClick={() => setSelectedDomain(null)} variant="icon" className="-mr-3">
            <Icon set="lucide" name="x" size="sm" />
          </Button>
        </div>

        {selectedDomain && (
          <div className="flex flex-col gap-12 px-6">
            {isSelectedAvailable && registrars.length > 0 && renderPurchaseButtons(registrars)}

            {isSelectedForSale && selectedStatus?.offers && selectedStatus.offers.length > 0 && (
              <>
                <div className="flex flex-col gap-4">
                  <p className="text-white">Price</p>
                  <div className="flex flex-col gap-2">
                    {Array.from(new Map(selectedStatus.offers.map(offer => 
                      [`${offer.price}-${offer.currency}`, offer]
                    )).values()).map((offer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-white text-lg">{formatPrice(offer.price, offer.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {renderPurchaseButtons(registrars)}
              </>
            )}

            {isSelectedMarketed && (!selectedStatus?.offers || selectedStatus.offers.length === 0) && 
              renderPurchaseButtons([
                { name: 'Atom', url: `https://www.atom.com/premium-domains-for-sale/q/${selectedDomain.domain}` },
                { name: 'Afternic', url: `https://www.afternic.com/forsale/${selectedDomain.domain}` },
                { name: 'Sedo', url: `https://sedo.com/search/?keyword=${selectedDomain.domain}` }
              ])
            }

            <div className="flex flex-col gap-4">
              <p className="text-white">Data</p>
              <div className="border p-5">
                {isLoadingWhois ? (
                  <div className="flex flex-col gap-2 animate-pulse">
                    <div className="h-3 bg-neutral-900 w-3/4" />
                    <div className="h-3 bg-neutral-900 w-1/2" />
                    <div className="h-3 bg-neutral-900 w-2/3" />
                  </div>
                ) : whoisError || !whoisData || (!whoisData.registrar && !whoisData.created_date && !whoisData.expiration_date && !whoisData.updated_date && !whoisData.registrant_organization && (!whoisData.name_servers || whoisData.name_servers.length === 0)) ? (
                  <p className="text-grey text-sm">WHOIS data unavailable</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {whoisData.registrar && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Registrar</span>
                        <span className="text-white">{whoisData.registrar}</span>
                      </div>
                    )}
                    {whoisData.created_date && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Created</span>
                        <span className="text-white">{formatDate(whoisData.created_date)}</span>
                      </div>
                    )}
                    {whoisData.expiration_date && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Expires</span>
                        <span className="text-white">{formatDate(whoisData.expiration_date)}</span>
                      </div>
                    )}
                    {whoisData.updated_date && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Updated</span>
                        <span className="text-white">{formatDate(whoisData.updated_date)}</span>
                      </div>
                    )}
                    {whoisData.registrant_organization && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Organization</span>
                        <span className="text-white">{whoisData.registrant_organization}</span>
                      </div>
                    )}
                    {whoisData.name_servers && whoisData.name_servers.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-grey text-sm">Name Servers</span>
                        <div className="flex flex-col gap-0.5">
                          {whoisData.name_servers.map((ns, index) => (
                            <span key={index} className="text-white text-sm">{ns}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default function DomainsClient() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <DomainsContent />
    </Suspense>
  );
}
