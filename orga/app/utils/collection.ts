type Comparable = number | string | Date;
type Order = 'asc' | 'desc';

export const sumBy = <K extends PropertyKey, T extends Record<K, number>>(collection: T[], propertyName: K): number =>
  collection.reduce((acc, item) => acc + item[propertyName], 0);

export const sum = (collection: number[]): number => collection.reduce((acc, item) => acc + item, 0);

export const maxBy = <K extends PropertyKey, T extends Record<K, Comparable>>(
  collection: T[],
  propertyName: K,
): T | null => {
  if (collection.length === 0) return null;
  return collection.reduce(
    (maxItem, item) => (item[propertyName] > maxItem[propertyName] ? item : maxItem),
    collection[0]!,
  );
};

export const minBy = <K extends PropertyKey, T extends Record<K, Comparable>>(
  collection: T[],
  propertyName: K,
): T | null => {
  if (collection.length === 0) return null;
  return collection.reduce(
    (minItem, item) => (item[propertyName] < minItem[propertyName] ? item : minItem),
    collection[0]!,
  );
};

export const orderBy = <K extends PropertyKey, T extends Record<K, unknown>>(
  collection: T[],
  propertyNames: K | K[],
  orders?: Order | Order[],
): T[] => {
  if (collection.length === 0) return [];

  const names = Array.isArray(propertyNames) ? propertyNames : [propertyNames];
  const orderList = Array.isArray(orders) ? orders : [orders];

  const propertyOrders = names.map((propertyName, index): [K, Order] => [propertyName, orderList[index] ?? 'asc']);

  return collection.toSorted((a, b) => {
    for (const [propertyName, order] of propertyOrders) {
      const aValue = a[propertyName];
      const bValue = b[propertyName];
      let comparisonResult;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparisonResult = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparisonResult = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparisonResult = aValue.getTime() - bValue.getTime();
      } else {
        comparisonResult = String(aValue).localeCompare(String(bValue));
      }
      if (comparisonResult !== 0) {
        return order === 'asc' ? comparisonResult : -comparisonResult;
      }
    }
    return 0;
  });
};

export function pick<T extends object, K extends PropertyKey>(
  source: T,
  properties: K[],
): Partial<Pick<T, Extract<K, keyof T>>> {
  const object: Record<PropertyKey, unknown> = {};
  properties.forEach((property) => {
    const value = (source as Record<PropertyKey, unknown>)[property];
    if (!value && !Object.hasOwn(source, property)) {
      return;
    }
    object[property] = value;
  });
  return object as Partial<Pick<T, Extract<K, keyof T>>>;
}
