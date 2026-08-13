'use client';

// import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toast } from '@heroui/react';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';

export function Providers({ children, locale, messages }: { children: React.ReactNode, locale: string, messages: AbstractIntlMessages }) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {/* <ThemeProvider attribute='class' defaultTheme='system' themes={['light', 'dark']}> */}
          <Toast.Provider placement='top end'/>
          {children}
        {/* </ThemeProvider> */}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}