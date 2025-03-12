/**
 * Like {@link Pick} only distributes across a union.
 */
export type DistributedPick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;

/**
 * Patch a given type with replacement properties, optionally omitting keys.
 */
export type PatchType<
  T,
  U extends Partial<Record<keyof T, unknown>>,
  OmitKeys extends PropertyKey = never,
> = {
  [K in keyof Omit<T, OmitKeys>]: K extends keyof U
    ? U[K]
    : K extends keyof T
      ? T[K]
      : never;
};

/**
 * Get the instance type of a constructor type.
 */
export type InstanceType<T> = T extends new () => infer I ? I : never;
