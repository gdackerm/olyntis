import { useEffect, useState } from 'react';

const KEY = 'olyntis:ai-onboarding-seen';

export function useOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(KEY)) {
      setIsOpen(true);
    }
  }, []);

  function close() {
    sessionStorage.setItem(KEY, '1');
    setIsOpen(false);
  }

  return { isOpen, close };
}
