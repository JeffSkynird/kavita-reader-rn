export type OpdsLink = {
  rel?: string;
  type?: string;
  href: string;
};

export type OpdsEntry = {
  id: string;
  title: string;
  updated?: string;
  summary?: string;
  content?: string;
  links: OpdsLink[];
};

export type OpdsRootFeed = {
  id?: string;
  title?: string;
  updated?: string;
  icon?: string;
  links: OpdsLink[];
  entries: OpdsEntry[];
};
