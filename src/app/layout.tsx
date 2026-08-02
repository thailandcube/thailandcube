import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import Navbar from './_components/Navbar';
import { Providers } from './providers';
import { getLocale, getMessages } from 'next-intl/server';
import Footer from './_components/Footer';
import 'flag-icons/css/flag-icons.min.css';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ThailandCube',
  description: 'A web application from ThailandCube',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${prompt.className}`}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <Providers locale={locale} messages={messages}>
          <Navbar/>
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
