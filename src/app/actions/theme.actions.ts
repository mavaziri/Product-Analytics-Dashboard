'use server';

import { cookies } from 'next/headers';

export async function setThemeCookie(theme: 'light' | 'dark'): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export async function getThemeCookie(): Promise<'light' | 'dark'> {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme');

  return (theme?.value as 'light' | 'dark') || 'light';
}
