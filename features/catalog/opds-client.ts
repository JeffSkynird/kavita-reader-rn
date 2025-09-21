import { XMLParser } from 'fast-xml-parser';

import { createApiUrl } from '@/features/auth/utils';
import type { SessionState } from '@/features/auth/types';

import type { OpdsEntry, OpdsLink, OpdsRootFeed } from './types';

type RawLink = {
  '@_href'?: string;
  '@_rel'?: string;
  '@_type'?: string;
};

type RawEntry = {
  id?: string;
  title?: string | { '#text'?: string };
  updated?: string;
  summary?: string | { '#text'?: string };
  content?: string | { '#text'?: string };
  link?: RawLink | RawLink[];
};

type RawFeed = {
  feed?: {
    id?: string;
    title?: string | { '#text'?: string };
    updated?: string;
    icon?: string;
    link?: RawLink | RawLink[];
    entry?: RawEntry | RawEntry[];
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  trimValues: true,
  ignoreDeclaration: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeLink(link: RawLink | undefined): OpdsLink | null {
  if (!link?.['@_href']) {
    return null;
  }

  return {
    href: link['@_href'],
    rel: link['@_rel'],
    type: link['@_type'],
  };
}

function normalizeText(value?: string | { '#text'?: string }): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value['#text'];
}

function normalizeEntry(entry: RawEntry | undefined): OpdsEntry | null {
  if (!entry?.id) {
    return null;
  }

  const links = asArray(entry.link)
    .map(normalizeLink)
    .filter((link): link is OpdsLink => Boolean(link));

  return {
    id: entry.id,
    title: normalizeText(entry.title) ?? entry.id,
    updated: entry.updated,
    summary: normalizeText(entry.summary),
    content: normalizeText(entry.content),
    links,
  };
}

function normalizeFeed(raw: RawFeed): OpdsRootFeed {
  const feed = raw.feed;

  if (!feed) {
    throw new Error('The OPDS feed has no data.');
  }

  const links = asArray(feed.link)
    .map(normalizeLink)
    .filter((link): link is OpdsLink => Boolean(link));

  const entries = asArray(feed.entry)
    .map(normalizeEntry)
    .filter((entry): entry is OpdsEntry => Boolean(entry));

  return {
    id: feed.id,
    title: normalizeText(feed.title),
    updated: feed.updated,
    icon: feed.icon,
    links,
    entries,
  };
}

export function resolveOpdsHref(baseUrl: string, href: string): string {
  if (/^https?:/i.test(href)) {
    return href;
  }

  return createApiUrl(baseUrl, href);
}

export class OpdsClient {

  static async fetchRoot(session: SessionState): Promise<OpdsRootFeed> {
    if (!session.apiKey) {
      throw new Error(
        'No API Key found in the session. Go to Settings and enter your API Key to enable OPDS.',
      );
    }

    const endpoint = createApiUrl(session.baseUrl, `/api/opds/${session.apiKey}`);
    return this.fetchFromUrl(endpoint);
  }

  static async fetchByHref(session: SessionState, href: string): Promise<OpdsRootFeed> {
    const endpoint = resolveOpdsHref(session.baseUrl, href);
    return this.fetchFromUrl(endpoint);
  }

  private static async fetchFromUrl(url: string): Promise<OpdsRootFeed> {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/atom+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching the OPDS feed (${response.status}).`);
    }

    const xml = await response.text();
    const parsed = parser.parse(xml) as RawFeed;

    return normalizeFeed(parsed);
  }
}
