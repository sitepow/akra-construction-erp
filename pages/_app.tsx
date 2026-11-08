import 'notyf/notyf.min.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import { Sarabun } from 'next/font/google';
import { Provider } from 'react-redux';
import store from '@/redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { I18nProvider } from '@react-aria/i18n';

const sarabun = Sarabun({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const muiTheme = createTheme({
  typography: {
    fontFamily: sarabun.style.fontFamily,
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider locale="th-TH-u-ca-buddhist">
      <Provider store={store}>
        <NextUIProvider
          disableAnimation
          disableRipple
          skipFramerMotionAnimations
        >
          <NextThemesProvider attribute="class" defaultTheme="light">
            <ThemeProvider theme={muiTheme}>
              <style jsx global>{`
                :root {
                  --font-family: ${sarabun.style.fontFamily};
                }

                body {
                  font-family: var(--font-family), sans-serif;
                }

                * {
                  letter-spacing: -0.035em;
                }
              `}</style>
              <Component {...pageProps} />
            </ThemeProvider>
          </NextThemesProvider>
        </NextUIProvider>
      </Provider>
    </I18nProvider>
  );
}
