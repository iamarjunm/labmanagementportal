const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_DATASET ?? 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-04-23';

function requireProjectId() {
  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
  }

  return projectId;
}

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'http://localhost:3333',
  token: process.env.SANITY_API_TOKEN ?? process.env.SANITY_WRITE_TOKEN ?? '',
};

export function groqString(value: string) {
  return JSON.stringify(value);
}

export async function sanityQuery<T>(query: string): Promise<T> {
  const url = new URL(
    `https://${requireProjectId()}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
  );
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), {
    headers: sanityConfig.token
      ? {Authorization: `Bearer ${sanityConfig.token}`}
      : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Sanity query failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.result as T;
}

export async function sanityMutate<T>(mutations: unknown[]): Promise<T> {
  const response = await fetch(
    `https://${requireProjectId()}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sanityConfig.token ? {Authorization: `Bearer ${sanityConfig.token}`} : {}),
      },
      body: JSON.stringify({mutations}),
    },
  );

  if (!response.ok) {
    throw new Error(`Sanity mutation failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function createDocumentId(prefix: string, value: string) {
  return `${prefix}-${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}