// Utility functions to convert between snake_case and camelCase

export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const convertObjectKeys = <T extends Record<string, any>>(
  obj: T,
  converter: (key: string) => string
): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectKeys(item, converter));
  }

  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = converter(key);
    converted[newKey] = convertObjectKeys(value, converter);
  }
  return converted;
};

export const toCamelCaseObject = <T extends Record<string, any>>(obj: T): T => {
  return convertObjectKeys(obj, toCamelCase) as T;
};

export const toSnakeCaseObject = <T extends Record<string, any>>(obj: T): any => {
  return convertObjectKeys(obj, toSnakeCase);
};
