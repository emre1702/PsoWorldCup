import { Observable } from 'rxjs';

export type AsyncReturnType<
  T extends (...args: any) => Promise<any> | Observable<any>
> = T extends (...args: any) => Promise<infer R>
  ? R
  : T extends (...args: any) => Observable<infer R>
  ? R
  : T;
