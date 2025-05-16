"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';


export default function ToggleDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
    
  useEffect(() => {
    // Check the initial theme preference
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <button 
        onClick={toggleDarkMode}
        className={pathname === "/" ? "absolute top-4 right-4 bg-accent text-secondary-foreground rounded-full aspect-square w-10" : "flex gap-2 w-full hover:bg-secondary text-secondary-foreground rounded-md py-1 px-2"}
    >
      {pathname === "/" ? 
        (isDarkMode ? <Sun className="m-auto" /> : <Moon className="m-auto" />) : 
        <>
          {isDarkMode ? <Sun className="my-auto size-4" /> : <Moon className="my-auto size-4" />}
          <span className='my-auto text-sm'>Toggle Dark Mode</span>
        </>
      }
    </button>
  );
}