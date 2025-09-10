import { useEffect } from "react";

export const usePageTitle = (title: string) => {
  useEffect(() => {
    // const prevTitle = document.title;
    document.title = `${title} | Coursecademy `;

    return () => {
      document.title = "Coursecademy";
    }
  }, [title])
}