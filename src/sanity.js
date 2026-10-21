import { createClient } from '@sanity/client';

// Public, read-only client (the dataset is public). Writes never happen in the browser:
// the admin page talks to /api/admin, which holds the write token on the server.
export const client = createClient({
  projectId: '84ksnydx',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-05-14',
});
