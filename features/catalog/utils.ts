import type { OpdsLink } from './types';

const NAVIGATION_RELS = new Set([
  'subsection',
  'start',
  'up',
  'down',
  'related',
  'self',
  'http://opds-spec.org/crawlable',
]);

const ACQUISITION_RELS = new Set([
  'http://opds-spec.org/acquisition',
  'http://opds-spec.org/acquisition/open-access',
  'http://opds-spec.org/acquisition/borrow',
  'http://opds-spec.org/acquisition/sample',
]);

const ACQUISITION_TYPE_HINTS = [
  'application/epub',
  'application/pdf',
  'application/x-cbz',
  'application/x-cbr',
  'application/zip',
  'application/x-zip',
  'application/octet-stream',
  'application/x-mobipocket',
  'application/vnd.amazon.ebook',
];

export function isNavigationLink(link: OpdsLink): boolean {
  const rel = link.rel?.toLowerCase();
  const type = link.type?.toLowerCase() ?? '';

  if (rel && NAVIGATION_RELS.has(rel)) {
    return true;
  }

  if (type.includes('application/atom+xml') || type.includes('application/opds+json')) {
    return true;
  }

  return false;
}

export function isAcquisitionLink(link: OpdsLink): boolean {
  const rel = link.rel?.toLowerCase();
  const type = link.type?.toLowerCase() ?? '';

  if (rel && (ACQUISITION_RELS.has(rel) || rel.startsWith('http://opds-spec.org/acquisition'))) {
    return true;
  }

  return ACQUISITION_TYPE_HINTS.some((hint) => type.includes(hint));
}

export function describeLinkType(link: OpdsLink): 'navigation' | 'acquisition' | 'unknown' {
  if (isNavigationLink(link)) {
    return 'navigation';
  }

  if (isAcquisitionLink(link)) {
    return 'acquisition';
  }

  return 'unknown';
}
