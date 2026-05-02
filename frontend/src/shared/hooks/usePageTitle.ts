import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | ShopWave`;
    return () => { document.title = 'ShopWave'; };
  }, [title]);
};
