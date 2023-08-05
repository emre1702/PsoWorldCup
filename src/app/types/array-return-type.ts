export type ArrayReturnType<T extends Array<any>> = T extends Array<infer R>
  ? R
  : T;
