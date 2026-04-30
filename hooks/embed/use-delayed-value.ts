import { useEffect, useState } from "react";

export function useDelayedValue<T>(value: T, delay: number) {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    if (value === delayed) return;
    const t = setTimeout(() => setDelayed(value), delay);
    return () => clearTimeout(t);
  }, [value, delay, delayed]);

  return delayed;
}
