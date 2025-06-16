// Helper functions to ensure correct paths in static export

/**
 * Gets the correct base URL for assets in both development and production
 */
export const getBasePath = (): string => {
  // In the browser, use the <base> tag href or default to '/'
  if (typeof window !== 'undefined') {
    const baseElement = document.querySelector('base');
    return baseElement?.getAttribute('href') || '/';
  }
  
  // During server-side rendering/static generation
  return process.env.BASE_PATH || '/';
};

/**
 * Creates a URL with the correct base path for assets
 */
export const getAssetPath = (path: string): string => {
  const basePath = getBasePath();
  // Remove duplicate slashes and ensure proper joining
  return `${basePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};