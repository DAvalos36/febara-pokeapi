"use client";

import type { ThemeProviderProps } from "next-themes";

import { I18nProvider } from "@heroui/react/rac";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <I18nProvider locale="es-MX">
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </I18nProvider>
  );
}
