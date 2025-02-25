import { useEffect, useState } from "react";

export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function cleanObject<T extends object>(obj: T): Partial<T> {
  const isEmptyObject = (obj: object): boolean =>
    obj && Object.keys(obj).length === 0;

  const isEmptyValue = (value: any): boolean =>
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(value) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && isEmptyObject(value));

  const clean = (obj: any): any => {
    // Handle arrays
    if (Array.isArray(obj)) {
      const cleanArray = obj
        .map((item) => (typeof item === "object" ? clean(item) : item))
        .filter((item) => !isEmptyValue(item));
      return cleanArray.length ? cleanArray : undefined;
    }

    // Handle objects
    if (typeof obj === "object" && obj !== null) {
      const cleanObj = Object.entries(obj).reduce(
        (acc, [key, value]) => {
          const cleanValue = typeof value === "object" ? clean(value) : value;
          if (!isEmptyValue(cleanValue)) {
            acc[key] = cleanValue;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      return Object.keys(cleanObj).length ? cleanObj : undefined;
    }

    return obj;
  };

  return clean(obj) || {};
}

export function toLowerCaseKeys(obj) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.toLowerCase(),
        toLowerCaseKeys(value), // Recursively process nested objects
      ]),
    );
  } else {
    // If not an object, return the value as is
    return obj;
  }
}
