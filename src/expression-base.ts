import assert from "node:assert";
import { shouldAliasName as isAliasRequired } from "./reserved.ts";

export declare const ExpressionType: unique symbol;
export type ExpressionType = typeof ExpressionType;

export declare const ExpressionPaths: unique symbol;
export type ExpressionPaths = typeof ExpressionPaths;

declare const TypeName: unique symbol;
type TypeName = typeof TypeName;

/**
 * Gives a descriptive name to a type brand so that compiler errors include the
 * name instead of "unique symbol".
 */
export type NamedType<K extends string> = { [TypeName]: K };

declare const LogicExpressionType: NamedType<"LogicExpression">;
export type LogicExpressionType = typeof LogicExpressionType;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- needed for compat with AWS
export type DocumentValue = Record<string, any>;

/**
 * Branding type to represent an expression with a specific evaluated type.
 */
export type Expression<T extends DocumentValue = DocumentValue, V = unknown> = {
  [ExpressionPaths]: ObjectPaths<T>;
  [ExpressionType]: V;
};

/**
 * Get all the object path tuples for the given type.
 */
export type Paths<
  T,
  MaxDepth extends number = 10,
  DepthLimiter extends unknown[] = [],
> = DepthLimiter extends {
  length: MaxDepth;
}
  ? never
  : unknown extends T
    ? (string | number)[]
    : T extends readonly (infer Element)[]
      ? [number] | [number, ...Paths<Element, MaxDepth, [0, ...DepthLimiter]>]
      : T extends DocumentValue
        ? ObjectPaths<T, MaxDepth, DepthLimiter>
        : never;

/**
 * Get all the dot-separated object paths for the given object type.
 */
export type ObjectPaths<
  T extends DocumentValue,
  MaxDepth extends number = 10,
  DepthLimiter extends unknown[] = [],
> = {
  [K in Extract<keyof T, string>]:
    | [K]
    | [K, ...Paths<Exclude<T[K], undefined>, MaxDepth, [0, ...DepthLimiter]>];
}[Extract<keyof T, string>];

/**
 * Get the value type at the given object path.
 */
export type PathValue<T, Path> = Path extends keyof T
  ? T[Path]
  : Path extends [infer K extends keyof T]
    ? T[K]
    : Path extends [infer K extends keyof T, ...infer Rest]
      ? PathValue<T[K], Rest>
      : never;

export class ExpressionBase<T extends DocumentValue, V = unknown>
  implements Expression<T, V>
{
  declare public readonly [ExpressionPaths]: ObjectPaths<T>;
  declare public readonly [ExpressionType]: V;
}

/**
 * Flexible type for specifying a path conveniently.
 */
export type PathSpec<T extends DocumentValue> =
  | ObjectPaths<T>[0]
  | ObjectPaths<T>;
export type PathSpecArgs<T extends DocumentValue> =
  | ObjectPaths<T>
  | [PathSpec<T>];

/**
 * Represents a name in an expression.
 */
export class NameExpression<
  T extends DocumentValue,
  V = unknown,
> extends ExpressionBase<T, V> {
  readonly #path: ObjectPaths<T>;

  public get path(): ObjectPaths<T> {
    return this.#path;
  }

  public constructor(...path: PathSpecArgs<T>) {
    super();
    this.#path = path.flat() as unknown as ObjectPaths<T>;
  }
}

/**
 * Represents a value in an expression.
 */
export class ValueExpression<T extends DocumentValue, V> extends ExpressionBase<
  T,
  V
> {
  readonly #value: V;

  public get value(): V {
    return this.#value;
  }

  public constructor(value: V) {
    super();
    this.#value = value;
  }
}

/**
 * An expression which can be compiled into a string and name/value maps using
 * {@link ExpressionCommandBuilder}.
 */
export abstract class CompoundExpressionBase<
  T extends DocumentValue,
  V = unknown,
> extends ExpressionBase<T, V> {
  public abstract get tokens(): readonly Token<T>[];
}

/**
 * An expression which can be compiled into a string and name/value maps using
 * {@link ExpressionCommandBuilder}.
 */
export class CompoundExpression<
  T extends DocumentValue,
  V = unknown,
> extends CompoundExpressionBase<T, V> {
  readonly #tokens: readonly Token<T>[];

  public get tokens(): readonly Token<T>[] {
    return this.#tokens;
  }

  public constructor(tokens: readonly Token<T>[]) {
    super();
    this.#tokens = tokens;
  }
}

/**
 * Union of possible elements in an expression.
 */
export type Token<T extends DocumentValue> = string | Expression<T>;

/**
 * Returns true if the value is an expression.
 */
export function isExpression<T extends DocumentValue>(
  value: unknown
): value is Expression<T> {
  return value instanceof ExpressionBase;
}

/**
 * Part of a command input which can accept an expression.
 */
export type ExpressionCommandInput = {
  ExpressionAttributeNames?: Record<string, string> | undefined;
  ExpressionAttributeValues?: Record<string, unknown> | undefined;
};

/**
 * Options for the {@link buildCommand} function.
 */
export type ExpressionOptions = {
  simplifyExpressions?: boolean;
};

/**
 * Builds expressions for use in commands.
 */
export class ExpressionCommandBuilder<T extends DocumentValue> {
  static readonly #defaultOptions: ExpressionOptions = {
    // default to making debugging easier but higher performance on prod
    // eslint-disable-next-line n/no-process-env -- one-off, well-defined key
    simplifyExpressions: process.env["NODE_ENV"] !== "production",
  };

  /**
   * Get default options for creating expressions.
   */
  public static get defaultOptions(): ExpressionOptions {
    return this.#defaultOptions;
  }

  readonly #names: Map<string, string>;
  readonly #values: Map<string, unknown>;
  readonly #options: ExpressionOptions;

  /**
   * Returns an object containing `ExpressionAttributeValues` and
   * `ExpressionAttributeNames`, if any are defined.
   */
  public get maps(): ExpressionCommandInput {
    const maps: ExpressionCommandInput = {};
    if (this.#names.size > 0) {
      maps.ExpressionAttributeNames = Object.fromEntries(this.#names);
    }
    if (this.#values.size > 0) {
      maps.ExpressionAttributeValues = Object.fromEntries(this.#values);
    }
    return maps;
  }

  public constructor(
    input?: ExpressionCommandInput,
    options: ExpressionOptions = ExpressionCommandBuilder.defaultOptions
  ) {
    this.#names = input?.ExpressionAttributeNames
      ? new Map<string, string>(Object.entries(input.ExpressionAttributeNames))
      : new Map<string, string>();
    this.#values = input?.ExpressionAttributeValues
      ? new Map<string, unknown>(
          Object.entries(input.ExpressionAttributeValues)
        )
      : new Map<string, unknown>();
    this.#options = options;
  }

  /**
   * Build the given expression to a string and store then names and values in
   * this builder instance.
   */
  public build<V>(expression: Expression<T, V>): string {
    if (!(expression instanceof CompoundExpressionBase)) {
      throw new TypeError(
        `expected expression to be a CompoundExpression instance`
      );
    }
    let expressionString = "";

    for (const token of expression.tokens) {
      if (typeof token === "string") {
        expressionString += token;
      } else if (token instanceof NameExpression) {
        let first = true;
        for (const name of token.path) {
          if (typeof name === "number") {
            expressionString += `[${name}]`;
          } else {
            if (!first) {
              expressionString += ".";
            }
            expressionString += this.#mergeName(name);
          }
          first = false;
        }
      } else if (token instanceof ValueExpression) {
        const key = `:v${this.#values.size}`;
        this.#values.set(key, token.value);
        expressionString += key;
      } else if (token instanceof CompoundExpressionBase) {
        expressionString += this.build(token as unknown as Expression<T>);
      } else {
        throw new TypeError("unknown token type");
      }
    }

    return expressionString;
  }

  /**
   * Merge the name into the current name map and return the key.
   */
  #mergeName(name: string): string {
    if (this.#options.simplifyExpressions && !isAliasRequired(name)) {
      return name;
    }
    const key = `#n${this.#names.size}`;
    this.#names.set(key, name);
    return key;
  }
}

/**
 * Template literal tag function to create an expression.
 */
export const expr = Object.assign(
  <T extends DocumentValue, V = unknown>(
    strings: readonly string[],
    ...tokens: Token<T>[]
  ): CompoundExpressionBase<T, V> => {
    return new CompoundExpression(tokenize(strings, ...tokens));
  },
  {
    /**
     * Shortcut for creating a {@link NameExpression} instance.
     */
    n<T extends DocumentValue>(...path: PathSpecArgs<T>): NameExpression<T> {
      return new NameExpression(...path);
    },

    /**
     * Shortcut for creating a {@link ValueExpression} instance.
     */
    v<T extends DocumentValue, V>(value: V): ValueExpression<T, V> {
      return new ValueExpression(value);
    },
  }
);

/**
 * Template literal tag function to create an array of tokens.
 */
export function tokenize<T extends DocumentValue>(
  strings: readonly string[],
  ...tokens: Token<T>[]
): Token<T>[] {
  assert.strictEqual(strings.length, tokens.length + 1);
  const nodes: Token<T>[] = [];

  for (let i = 0; i < strings.length; ++i) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- bounds already checked
    nodes.push(strings[i]!);

    if (i < tokens.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- bounds already checked
      nodes.push(tokens[i]!);
    }
  }

  return nodes;
}

/**
 * Join expressions together with the given separator value.
 */
export function joinTokens<T extends DocumentValue, V = void>(
  tokens: Token<T>[],
  separator: string,
  start = "",
  end = ""
): CompoundExpressionBase<T, V> {
  // the expr function cuts these together for us -- we just need add an empty
  // string to start and end since it expects to start and end with a
  // `strings` element
  const strings = Array.from({ length: tokens.length + 1 }).fill(
    separator
  ) as string[];
  strings[0] = start;
  strings[strings.length - 1] = end;

  return expr(strings, ...tokens);
}
