type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDictionary = { [key: string]: any };

export function classNames(...classes: (ClassValue | ClassArray | ClassDictionary)[]): string {
  return classes
    .flat()
    .filter(Boolean)
    .map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') return entry;
      if (Array.isArray(entry)) return classNames(...entry);
      if (typeof entry === 'object' && entry !== null) {
        return Object.entries(entry)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ');
}