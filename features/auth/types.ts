export type LoginPayload = {
  host: string;
  username: string;
  password: string;
  apiKey?: string;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
};

export type SessionState = SessionTokens & {
  host: string;
  baseUrl: string;
  username?: string;
  apiKey?: string;
};

export type SessionStatus =
  | 'loading'
  | 'anonymous'
  | 'authenticating'
  | 'authenticated';
