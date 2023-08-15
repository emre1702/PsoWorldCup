export function outputAllValuesRecursive(obj: any, keyPrefix = '') {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        console.log(`${keyPrefix}${key}:`, element);
        outputAllValuesRecursive(element, `${keyPrefix}${key}.`);
      }
    }
  }
}
