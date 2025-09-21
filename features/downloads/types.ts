export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error';

export type DownloadItem = {
  id: string;
  title?: string;
  sourceUrl: string;
  resolvedUrl: string;
  mimeType?: string;
  rel?: string;
  status: DownloadStatus;
  progress: number;
  localUri?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type EnqueueDownloadPayload = {
  title?: string;
  sourceUrl: string;
  resolvedUrl: string;
  mimeType?: string;
  rel?: string;
};
