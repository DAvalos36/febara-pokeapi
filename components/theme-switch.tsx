"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";

import { MoonFilledIcon, SunFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const isLight = resolvedTheme === "light";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div aria-hidden className="h-8 w-8" />;

  return (
    <Button
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      className={className}
      size="sm"
      variant="ghost"
      onPress={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <SunFilledIcon size={20} /> : <MoonFilledIcon size={20} />}
    </Button>
  );
};
