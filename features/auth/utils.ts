export function normalizeHost(host: string): string {
  const trimmed = host.trim();

  if (!trimmed) {
    throw new Error('Host cannot be empty.');
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;

  try {
    url = new URL(hasProtocol);
  } catch (error) {
    throw new Error('The provided host is not a valid URL.');
  }

  if (!/^https?:$/i.test(url.protocol)) {
    throw new Error('Only HTTP or HTTPS hosts are allowed.');
  }

  const loweredPath = url.pathname.toLowerCase();
  const opdsIndex = loweredPath.indexOf('/api/opds');

  let normalizedPath = opdsIndex >= 0 ? url.pathname.slice(0, opdsIndex) : url.pathname;

  normalizedPath = normalizedPath.replace(/\/+$|^$/u, '');

  url.pathname = normalizedPath ? (normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`) : '/';
  url.search = '';
  url.hash = '';

  return url.toString().replace(/\/+$/u, '');
}

export function createApiUrl(host: string, path: string): string {
  const base = normalizeHost(host);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, base.endsWith('/') ? base : `${base}/`);

  return url.toString();
}
