export type PartialRequired<T, Keys extends keyof T = keyof T> = Pick<Partial<T>, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: T[K];
  };

export type CustomNameFunction = ((name: string, file: string) => string);
export type CustomName = CustomNameFunction | string;

export interface Options {
  libraryName?: string;
  libraryDirectory?: string;
  style?: ((path: string, file: any) => string) | boolean | string;
  styleLibraryDirectory?: string;
  customStyleName?: CustomName;
  camel2DashComponentName?: boolean;
  camel2UnderlineComponentName?: boolean;
  fileName?: string;
  customName?: CustomName;
  transformToDefaultImport?: boolean;
}

export type NormalizedOptions = PartialRequired<
  Options,
  'libraryName' | 'libraryDirectory' | 'camel2DashComponentName' | 'style' | 'fileName' | 'transformToDefaultImport'
>;
