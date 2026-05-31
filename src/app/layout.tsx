import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'IUtasks: Organize Your Tasks with Ease',
  description: 'Effortlessly create, manage, and delete your tasks with IUtasks. Our clean and intuitive interface helps you stay organized and productive.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased`}>
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
