import useSWR from 'swr';
import { env } from '@/utils';
import { SessionOptions } from 'iron-session';

export interface SessionData {
  token: { accessToken: string; refreshToken: string };
  userId: string;
  name: string;
  permissions: any;
  company: any;
  email: string;
  isLoggedIn: boolean;
}

export const defaultSession = {
  token: { accessToken: '', refreshToken: '' },
  userId: '',
  name: '',
  permissions: [],
  company: {
    id: '',
    name: '',
    guaranteeHeader: null,
  },
  email: '',
  isLoggedIn: false,
};

async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  return fetch(input, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    ...init,
  }).then((res) => res.json());
}

export const sessionOptions: SessionOptions = {
  password: env.NEXT_PUBLIC_COOKIE_PASS,
  cookieName: env.NEXT_PUBLIC_COOKIE_NAME,
  cookieOptions: {
    secure: false,
  },
};

export default function getSession() {
  const { data: session, isLoading: sessionLoading } = useSWR(
    '/api/session',
    fetchJson<SessionData>,
    {
      fallbackData: defaultSession,
    }
  );

  return { session, sessionLoading };
}
