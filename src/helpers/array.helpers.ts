export default class ArrayHelpers {
  static groupBy<T, Key extends string | number | symbol>(
    arr: T[],
    fn: (item: T) => Key
  ): Record<Key, T[]> {
    return arr.reduce<Record<Key, T[]>>((prev, curr) => {
      const groupKey = fn(curr);
      const group = prev[groupKey] || [];
      group.push(curr);
      return { ...prev, [groupKey]: group };
    }, {} as Record<Key, T[]>);
  }
}
