import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    // Add a brief transition disable for smoother switching
    document.documentElement.classList.add('no-transitions');
    setTheme(newTheme);
    
    // Re-enable transitions after a brief moment
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 50);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-muted transition-colors duration-200"
          title="Toggle theme"
        >
          {isDark ? (
            <Moon className="h-5 w-5 text-muted-foreground transition-all duration-300 rotate-0" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground transition-all duration-300 rotate-0" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel className="text-xs font-semibold">Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onCheckedChange={() => handleThemeChange('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onCheckedChange={() => handleThemeChange('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onCheckedChange={() => handleThemeChange('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
