import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession, SessionOptions } from 'iron-session';
import { SessionData } from './utils/session';
import { menu } from './utils/menu';

export async function middleware(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const cookie = await cookies();

  const sessionOptions: SessionOptions = {
    password: process.env.COOKIE_PASS || '',
    cookieName: process.env.COOKIE_NAME || '',
    cookieOptions: {
      secure: false,
    },
  };
  const session = await getIronSession<SessionData>(cookie, sessionOptions);

  if (!session?.isLoggedIn) {
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl.toString());
  }

  const currentPathname = redirectUrl.pathname;
  const permissions = JSON.parse(session?.permissions || '[]');

  const currentMenuId = findMenuId(menu(), currentPathname);

  const hasPermission = permissions.some(
    (perm: any) => perm.id === currentMenuId && perm.permissions?.read == true
  );

  if (!hasPermission) {
    redirectUrl.pathname = '/reject';
    return NextResponse.redirect(redirectUrl.toString());
  }

  return NextResponse.next();
}

function findMenuId(menus: any[], pathname: string): string | null {
  for (const item of menus) {
    if (item.url === pathname) return item.id;
    if (item.subCategories) {
      for (const subItem of item.subCategories) {
        if (subItem.url === pathname) return item.id;
      }
    }
  }
  return null;
}

export const config = {
  matcher: ['/', '/protect/:path*'],
};
