/**
 * Format a price with proper thousand separators and decimal places
 * @param price - The price to format (as string or number)
 * @param currency - The currency code (e.g., 'USD')
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(price: string | number, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  const formattedPrice = numPrice % 1 === 0 
    ? numPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${formattedPrice}`;
}

/**
 * Format a date string to a localized date
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Format a date string to a localized date with options
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateWithOptions(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format image dimensions for display
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Formatted size string
 */
export function formatImageSize(width: number, height: number): string {
  return `${width} × ${height}`;
}
