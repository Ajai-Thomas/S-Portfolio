import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Your Sanity Project ID (84ksnydx) is used here
export const client = createClient({
  projectId: '84ksnydx',
  dataset: 'production',
  useCdn: true, // Speeds up queries by serving from CDN
  apiVersion: '2024-05-14', // Use a consistent date
});

// Get a pre-configured url-builder from your client
const builder = imageUrlBuilder(client);

// Function to easily get a CDN-optimized URL from a Sanity image object
export const urlFor = (source) => {
  return builder.image(source);
};
