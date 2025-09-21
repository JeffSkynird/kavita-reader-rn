import type { LoginPayload, SessionTokens } from '../types';
import { createApiUrl, normalizeHost } from '../utils';

type KavitaAuthResponse = {
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresAt?: string;
  expires_at?: string;
  expiration?: string;
  expiry?: string;
  expiresIn?: number;
  expires_in?: number;
  message?: string;
  error?: string;
  apiKey?: string;
};

type KavitaErrorResponse = {
  title?: string;
  status?: number;
  errors?: Record<string, string[] | string>;
  message?: string;
  error?: string;
};

async function readResponseBody(response: Response): Promise<{
  parsed?: KavitaAuthResponse | KavitaErrorResponse;
  raw: string;
}> {
  const raw = await response.text();

  if (!raw) {
    return { raw: '' };
  }

  try {
    return {
      raw,
      parsed: JSON.parse(raw) as KavitaAuthResponse,
    };
  } catch {
    return { raw };
  }
}

function resolveAccessToken(payload: KavitaAuthResponse): string | undefined {
  return (
    payload.accessToken ??
    payload.access_token ??
    payload.token ??
    undefined
  );
}

function resolveRefreshToken(payload: KavitaAuthResponse): string | undefined {
  return payload.refreshToken ?? payload.refresh_token;
}

function resolveExpiresAt(payload: KavitaAuthResponse): string | undefined {
  if (payload.expiresAt ?? payload.expires_at ?? payload.expiration ?? payload.expiry) {
    return (
      payload.expiresAt ??
      payload.expires_at ??
      payload.expiration ??
      payload.expiry
    );
  }

  const expiresIn = payload.expiresIn ?? payload.expires_in;

  if (typeof expiresIn === 'number') {
    return new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  return undefined;
}

function collectValidationErrors(payload?: KavitaErrorResponse): string | undefined {
  if (!payload?.errors) {
    return undefined;
  }

  const entries = Object.entries(payload.errors)
    .map(([field, value]) => {
      if (Array.isArray(value)) {
        return `${field}: ${value.join(', ')}`;
      }

      return `${field}: ${value}`;
    })
    .filter(Boolean);

  return entries.length ? entries.join('\n') : undefined;
}

export class AuthService {
  static async authenticateWithApiKey(
    payload: LoginPayload,
  ): Promise<SessionTokens & { baseUrl: string; apiKey?: string; username?: string }> {
    const baseUrl = normalizeHost(payload.host);
    const endpoint = createApiUrl(baseUrl, '/api/Account/login');

    const username = payload.username?.trim();
    const password = payload.password;

    if (!username || !password) {
      throw new Error('Username and password are required.');
    }

    const requestBody: Record<string, string> = {
      username,
      password,
    };

    if (payload.apiKey) {
      requestBody.apiKey = payload.apiKey.trim();
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const { parsed, raw } = await readResponseBody(response);

    if (!response.ok) {
      const errorMessage =
        parsed?.message ??
        parsed?.error ??
        collectValidationErrors(parsed) ??
        (raw ? raw.trim() : 'Could not authenticate with the Kavita server.');

      throw new Error(errorMessage);
    }

    if (!parsed) {
      throw new Error(
        'The server response is not valid JSON. Make sure to enter the base URL of your Kavita server (for example, http://192.168.1.18:5000).',
      );
    }

    const data = parsed;
    const accessToken = resolveAccessToken(data);

    if (!accessToken) {
      throw new Error('The server response did not include an access token.');
    }

    return {
      baseUrl,
      accessToken,
      refreshToken: resolveRefreshToken(data),
      expiresAt: resolveExpiresAt(data),
      apiKey: data.apiKey ?? requestBody.apiKey,
      username,
    };
  }
}
