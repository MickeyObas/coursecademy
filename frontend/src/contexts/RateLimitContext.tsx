import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { registerTrigger } from "../utils/rateLimitManager";

type RateLimitCtx = {
  isRateLimited: boolean;
  cooldown: number;
  triggerRateLimit: (seconds: number) => void;
};

const RateLimitContext = createContext<RateLimitCtx | undefined>(undefined);


export const RateLimitProvider = ({ children }: { children: ReactNode }) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const triggerRateLimit = (seconds: number) => {
    setIsRateLimited(true);
    setCooldown(seconds);
  };

  useEffect(() => {
    registerTrigger(triggerRateLimit);
  }, []);

  // countdown effect
  useEffect(() => {
    if (isRateLimited && cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, cooldown]);

  return (
    <RateLimitContext.Provider value={{ isRateLimited, cooldown, triggerRateLimit }}>
      {children}
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = () => {
  const ctx = useContext(RateLimitContext);
  if (!ctx) throw new Error("useRateLimit must be used inside RateLimitProvider");
  return ctx;
};

