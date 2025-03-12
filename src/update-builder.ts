import assert from "node:assert";
import {
  expr,
  ExpressionCommandBuilder,
  type DocumentValue,
  type Expression,
  type NamedType,
  type ObjectPaths,
  type PathValue,
  type Token,
} from "./expression-base.ts";
import { ExpressionBuilderBase } from "./expression-builder.ts";

export type UpdateExpressionType = NamedType<"UpdateExpression">;

/**
 * The required argument type for the `ADD` expression.
 */
export type AddArgType<V> = V extends number
  ? number
  : V extends Set<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    ? V
    : never;

/**
 * Extract the keys of T which have a number value.
 */
export type NumberKeys<T> = {
  [K in Extract<keyof T, string>]: Exclude<T[K], undefined> extends number
    ? K
    : never;
}[Extract<keyof T, string>];

/**
 * Contains methods to build an UpdateExpression value.
 *
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html}
 */
export class UpdateBuilder<
  T extends DocumentValue,
> extends ExpressionBuilderBase<T, UpdateExpressionType> {
  public static override build<T extends DocumentValue>(
    builder: ExpressionCommandBuilder<T>,
    expression:
      | string
      | Expression<T, UpdateExpressionType>
      | ((builder: UpdateBuilder<T>) => Expression<T, UpdateExpressionType>)
  ): string {
    return super.build(builder, expression, UpdateBuilder);
  }

  readonly #adds: Token<T>[];
  readonly #deletes: Token<T>[];
  readonly #removes: Token<T>[];
  readonly #sets: Token<T>[];

  public constructor(
    adds: Token<T>[] = [],
    deletes: Token<T>[] = [],
    removes: Token<T>[] = [],
    sets: Token<T>[] = []
  ) {
    super();
    this.#adds = adds;
    this.#deletes = deletes;
    this.#removes = removes;
    this.#sets = sets;
  }

  /**
   * Get the expression tokens for this update expression.
   */
  public override get tokens(): readonly Token<T>[] {
    const result: Token<T>[] = [];

    if (this.#adds.length > 0) {
      result.push("ADD ", ...this.#adds);
    }
    if (this.#deletes.length > 0) {
      if (result.length > 0) {
        result.push(" ");
      }
      result.push("DELETE ", ...this.#deletes);
    }
    if (this.#removes.length > 0) {
      if (result.length > 0) {
        result.push(" ");
      }
      result.push("REMOVE ", ...this.#removes);
    }
    if (this.#sets.length > 0) {
      if (result.length > 0) {
        result.push(" ");
      }
      result.push("SET ", ...this.#sets);
    }

    return result;
  }

  /**
   * Use the ADD action in an update expression to add a new attribute and its
   * values to an item.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.ADD}
   */
  public add<K extends ObjectPaths<T> | ObjectPaths<T>[0]>(
    path: K,
    value: AddArgType<PathValue<T, K>>
  ): UpdateBuilder<T> {
    return this.#combine("adds", [this.name(path), " ", this.value(value)]);
  }

  /**
   * Perform an arithmetic operation.
   */
  public expr(
    left: Expression<T, number> | NumberKeys<T> | number,
    operator: "+" | "-",
    right: Expression<T, number> | NumberKeys<T> | number
  ): Expression<T, number> {
    let leftToken: Expression<T>;
    let rightToken: Expression<T>;

    if (typeof left === "string") {
      leftToken = this.name(left);
    } else if (typeof left === "number") {
      leftToken = this.value(left);
    } else {
      leftToken = left;
    }

    if (typeof right === "string") {
      rightToken = this.name(right);
    } else if (typeof right === "number") {
      rightToken = this.value(right);
    } else {
      rightToken = right;
    }

    return expr`(${leftToken} ${operator} ${rightToken})`;
  }

  /**
   * Use the DELETE action in an update expression to remove one or more
   * elements from a set.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE}
   */
  public delete<K extends ObjectPaths<T> | ObjectPaths<T>[0]>(
    path: K,
    value: Extract<PathValue<T, K>, Set<unknown>>
  ): UpdateBuilder<T> {
    return this.#combine("deletes", [this.name(path), " ", this.value(value)]);
  }

  /**
   * If you want to avoid overwriting an existing attribute, you can use SET
   * with the {@link if_not_exists} function. The {@link if_not_exists} function
   * is specific to the SET action and can only be used in an update expression.
   */
  public if_not_exists<V>(
    path: ObjectPaths<T> | ObjectPaths<T>[0],
    value: V | Expression<T, V>
  ): Expression<T, V> {
    return expr`if_not_exists(${this.name(path)}, ${this.asValue(value)})`;
  }

  /**
   * If you want to avoid overwriting an existing attribute, you can use SET
   * with the {@link if_not_exists} function. The {@link if_not_exists} function
   * is specific to the SET action and can only be used in an update expression.
   */
  public list_append<K extends ObjectPaths<T> | ObjectPaths<T>[0]>(
    path: K,
    value:
      | Extract<PathValue<T, K>, unknown[]>
      | Expression<T, Extract<PathValue<T, K>, unknown[]>>
  ): Expression<T, Extract<PathValue<T, K>, unknown[]>>;
  public list_append<V extends unknown[]>(
    first: Expression<T, V>,
    second: Expression<T, V>
  ): Expression<T, V>;
  public list_append(
    first: Expression<T, unknown[]> | ObjectPaths<T> | ObjectPaths<T>[0],
    second: unknown[] | Expression<T, unknown[]>
  ): Expression<T, unknown[]> {
    return expr`list_append(${this.asName(first)}, ${this.asValue(second)})`;
  }

  /**
   * Use the REMOVE action in an update expression to remove one or more
   * attributes from an item in Amazon DynamoDB.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.REMOVE}
   */
  public remove(...path: ObjectPaths<T>): UpdateBuilder<T> {
    return this.#combine("removes", [this.name(path)]);
  }

  /**
   * Use the SET action in an update expression to add one or more attributes to
   * an item. If any of these attributes already exists, they are overwritten by
   * the new values. If you want to avoid overwriting an existing attribute, you
   * can use SET with the {@link if_not_exists} function. The
   * {@link if_not_exists} function is specific to the SET action and can only
   * be used in an update expression.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.SET}
   */
  public set<K extends ObjectPaths<T> | ObjectPaths<T>[0]>(
    path: K,
    value: PathValue<T, K> | Expression<T, PathValue<T, K>>
  ): UpdateBuilder<T> {
    return this.#combine("sets", [this.name(path), " = ", this.asValue(value)]);
  }

  /**
   * Create a new instance with the given sub-expressions merged in.
   */
  #combine(
    section: "adds" | "deletes" | "removes" | "sets",
    tokens: Token<T>[]
  ): UpdateBuilder<T> {
    return new UpdateBuilder(
      section === "adds" ? this.#combineTokens(this.#adds, tokens) : this.#adds,
      section === "deletes"
        ? this.#combineTokens(this.#deletes, tokens)
        : this.#deletes,
      section === "removes"
        ? this.#combineTokens(this.#removes, tokens)
        : this.#removes,
      section === "sets" ? this.#combineTokens(this.#sets, tokens) : this.#sets
    );
  }

  /**
   * If both sides are non-empty, returns a new list comprising both sides
   * separated with a comma; otherwise returns the non-empty list.
   */
  #combineTokens(left: Token<T>[], right: Token<T>[]): Token<T>[] {
    assert(right.length > 0);
    if (left.length === 0) {
      return right;
    }
    return [...left, ", ", ...right];
  }
}
