import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { MoonStar, Sun } from 'lucide-react';
import { Button } from '@nextui-org/react';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useNextTheme();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setChecked(theme === 'dark');
    }
  }, [theme, mounted]);

  const handleChange = () => {
    const newTheme = checked ? 'light' : 'dark';
    setTheme(newTheme);
    setChecked(!checked);
  };

  if (!mounted) return null;

  return (
    <div className="flex space-x-2" style={{ cursor: 'pointer' }}>
      {!checked ? (
        <Button isIconOnly variant="flat" radius="full" onClick={handleChange}>
          <Sun className="text-neutral-400 dark:text-white" />
        </Button>
      ) : (
        <Button isIconOnly variant="flat" radius="full" onClick={handleChange}>
          <MoonStar className="text-neutral-400 dark:text-white" />
        </Button>
      )}
    </div>
  );
};
