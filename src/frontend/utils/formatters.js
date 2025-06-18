/**
 * Formatters for displaying data in the UI
 */

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} [locale='es-MX'] - The locale to use
 * @param {string} [currency='MXN'] - The currency code
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value, locale = 'es-MX', currency = 'MXN') => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(value || 0);
};

/**
 * Format a date
 * @param {string|Date} date - The date to format
 * @param {boolean} [includeTime=false] - Whether to include the time
 * @param {string} [locale='es-MX'] - The locale to use
 * @returns {string} The formatted date string
 */
export const formatDate = (date, includeTime = false, locale = 'es-MX') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a phone number
 * @param {string} phone - The phone number to format
 * @returns {string} The formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Simple format for Mexican phone numbers
  // Assumes a 10-digit number
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  
  // Return as-is if we can't format it
  return phone;
};

/**
 * Format a file size
 * @param {number} bytes - The size in bytes
 * @returns {string} The formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} [maxLength=100] - Maximum length before truncating
 * @returns {string} The truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};
