import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "@/utils/dateUtils";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Create a stable debounced save function
  const saveToStorage = useCallback(
    (value: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key]
  );

  const debouncedSaveRef = useRef(debounce(saveToStorage, 300));

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Convert date strings back to Date objects for trackers
        if (key === "stride-trackers" && Array.isArray(parsed)) {
          const trackersWithDates = parsed.map(
            (tracker: {
              id: string;
              title: string;
              description: string;
              timeEstimate: number;
              deadline?: string;
              subtasks: Array<{ id: string; text: string; completed: boolean }>;
              createdAt: string;
              progress: number;
            }) => ({
              ...tracker,
              createdAt: new Date(tracker.createdAt),
              deadline: tracker.deadline
                ? new Date(tracker.deadline)
                : undefined,
            })
          );
          setStoredValue(trackersWithDates as T);
        } else {
          setStoredValue(parsed);
        }
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      debouncedSaveRef.current(valueToStore);
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
