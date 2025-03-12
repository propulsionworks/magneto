import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import assert from "node:assert";
import {
  CompoundExpressionBase,
  expr,
  ExpressionCommandBuilder,
  isExpression,
  joinTokens,
  NameExpression,
  tokenize,
  ValueExpression,
  type DocumentValue,
  type Expression,
  type LogicExpressionType,
  type ObjectPaths,
  type PathSpec,
  type PathSpecArgs,
  type PathValue,
  type Token,
} from "./expression-base.ts";

type ComparisonTypes = string | number;
type EqualityTypes = string | number | boolean | null;

type EqualityOperator = "=" | "<>";
type InequalityOperator = "<" | "<=" | ">" | ">=" | "=";

type AndOperator = "AND";
type BetweenOperator = "BETWEEN";
type ComparisonOperator = EqualityOperator | InequalityOperator;
type InOperator = "IN";
type NotOperator = "NOT";
type OrOperator = "OR";
type ParenthesesOperator = "(";

type AttributeExistsFunction = "attribute_exists";
type AttributeNotExistsFunction = "attribute_not_exists";
type AttributeTypeFunction = "attribute_type";
type BeginsWithFunction = "begins_with";
type ContainsFunction = "contains";
type SizeFunction = "size";

type FilterFunction =
  | AttributeExistsFunction
  | AttributeNotExistsFunction
  | AttributeTypeFunction
  | BeginsWithFunction
  | ContainsFunction;

type Operator =
  | AndOperator
  | BetweenOperator
  | ComparisonOperator
  | FilterFunction
  | InOperator
  | NotOperator
  | OrOperator
  | ParenthesesOperator
  | SizeFunction;

const precedence: Record<Operator, number> = {
  "=": 1,
  "<>": 1,
  "<": 1,
  "<=": 1,
  ">": 1,
  ">=": 1,
  IN: 2,
  BETWEEN: 3,
  attribute_exists: 4,
  attribute_not_exists: 4,
  attribute_type: 4,
  begins_with: 4,
  contains: 4,
  size: 4,
  "(": 4,
  // we make all these the same so that they get parenthesis anyway
  NOT: 5,
  AND: 5,
  OR: 5,
};

/**
 * The binary comparison operators supported by the given value type.
 */
export type BinaryComparisonOperator<V> = V extends ComparisonTypes
  ? "<>" | "<" | "<=" | ">" | ">=" | "="
  : V extends EqualityTypes
    ? "<>" | "="
    : never;

/**
 * The required argument type for the `contains` function.
 */
export type ContainsArgType<V> = V extends string
  ? string
  : V extends Set<infer E>
    ? E
    : V extends readonly (infer E)[]
      ? E
      : never;

/**
 * Wraps the operand in parenthesis if it is a {@link ExpressionBuilder} with a
 * lower precedence than the given operator.
 *
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Precedence}
 */
function parens<T extends DocumentValue>(
  operator: Operator,
  operand: Expression<T>
): Expression<T> {
  if (operand instanceof ExpressionBuilder && operand.operator) {
    const sameOperator = operator === operand.operator;
    const shouldBracket = precedence[operator] <= precedence[operand.operator];
    // we don't bracket if the operator is the same, for better legibility
    if (shouldBracket && !sameOperator) {
      return expr`(${operand})`;
    }
  }
  return operand;
}

/**
 * Provides common functionality for different kinds of expression builders.
 */
export abstract class ExpressionBuilderBase<
  T extends DocumentValue,
  V = void,
> extends CompoundExpressionBase<T, V> {
  /**
   * Builds this expression using the supplied builder.
   */
  public static build<T extends DocumentValue, V>(
    builder: ExpressionCommandBuilder<T>,
    expression: string | Expression<T, V>
  ): string;
  public static build<T extends DocumentValue, E extends Expression<T>, V>(
    builder: ExpressionCommandBuilder<T>,
    expression: string | Expression<T, V> | ((builder: E) => Expression<T, V>),
    factory: new () => E
  ): string;
  public static build<T extends DocumentValue, E extends Expression<T>, V>(
    builder: ExpressionCommandBuilder<T>,
    expression: string | Expression<T, V> | ((builder: E) => Expression<T, V>),
    factory?: new () => E
  ): string {
    if (typeof expression === "string") {
      return expression;
    }
    if (typeof expression === "function") {
      assert(factory);
      return builder.build(expression(new factory()));
    }
    return builder.build(expression);
  }

  /**
   * If the token is a string, return it as a name token, otherwise return the
   * token unchanged.
   */
  public asName<V>(
    tokenOrPath: PathSpec<T> | Expression<T, V>
  ): Expression<T, V> {
    if (isExpression<T>(tokenOrPath)) {
      return tokenOrPath;
    }
    return new NameExpression(tokenOrPath);
  }

  /**
   * If the token is a token instance, return it unchanged, otherwise return it
   * as a value token.
   */
  public asValue<V>(tokenOrValue: V | Expression<T, V>): Expression<T, V> {
    if (isExpression<T>(tokenOrValue)) {
      return tokenOrValue;
    }
    return new ValueExpression(tokenOrValue);
  }

  /**
   * Create a name token.
   */
  public name<K extends ObjectPaths<T>>(
    path: K
  ): Expression<T, PathValue<T, K>>;
  public name<K extends ObjectPaths<T>[0]>(
    path: K
  ): Expression<T, PathValue<T, K>>;
  public name(...path: PathSpecArgs<T>): Expression<T>;
  public name(...path: PathSpecArgs<T>): Expression<T> {
    return new NameExpression(...path);
  }

  /**
   * Create a value token.
   */
  public value<V>(value: V): Expression<T, V> {
    return new ValueExpression(value);
  }
}

/**
 * Contains methods to build an expression for use with ConditionExpression or
 * FilterExpression properties.
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html}
 */
export class ExpressionBuilder<T extends DocumentValue, V = void> //
  extends ExpressionBuilderBase<T, V>
{
  public static override build<T extends DocumentValue, V>(
    builder: ExpressionCommandBuilder<T>,
    expression:
      | string
      | Expression<T, V>
      | ((builder: ExpressionBuilder<T>) => Expression<T, V>)
  ): string;
  public static override build<T extends DocumentValue, V>(
    builder: ExpressionCommandBuilder<T>,
    expression:
      | string
      | Expression<T, V>
      | ((builder: ExpressionBuilder<T>) => Expression<T, V>)
      | undefined
  ): string | undefined;
  public static override build<T extends DocumentValue, V>(
    builder: ExpressionCommandBuilder<T>,
    expression:
      | string
      | Expression<T, V>
      | ((builder: ExpressionBuilder<T>) => Expression<T, V>)
      | undefined
  ): string | undefined {
    return expression
      ? super.build(builder, expression, ExpressionBuilder)
      : undefined;
  }

  readonly #tokens: readonly Token<T>[];

  public readonly operator: Operator | undefined;

  public override get tokens(): readonly Token<T>[] {
    return this.#tokens;
  }

  public constructor(tokens: readonly Token<T>[] = [], operator?: Operator) {
    super();
    this.#tokens = tokens;
    this.operator = operator;
  }

  /**
   * Create a clause in the expression. If this node already contains an
   * expression, it will be combined with "AND". The entire existing expression
   * is taken as the first operand of the AND, with parentheses added as
   * necessary. Alias for {@link where}.
   */
  public and(
    expression: ExpressionBuilder<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and(
    left: Expression<T, LogicExpressionType>,
    operator: "AND" | "OR",
    right: Expression<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<K extends PathSpec<T>>(
    left: K,
    operator: "IN",
    right: Extract<PathValue<T, K>, EqualityTypes>[]
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<V extends EqualityTypes>(
    left: Expression<T, V>,
    operator: "IN",
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<V>(
    left: Expression<T, V>,
    operator: BinaryComparisonOperator<V>,
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<K extends PathSpec<T>>(
    left: K,
    operator: BinaryComparisonOperator<PathValue<T, K>>,
    right: PathValue<T, K>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<K extends PathSpec<T>>(
    left: K,
    operator: "BETWEEN",
    lower: Extract<PathValue<T, K>, ComparisonTypes>,
    and: "AND",
    upper: Extract<PathValue<T, K>, ComparisonTypes>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and<V extends ComparisonTypes>(
    left: Expression<T, V>,
    operator: "BETWEEN",
    lower: Expression<T, V>,
    and: "AND",
    upper: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public and(
    left: PathSpec<T> | Expression<T>,
    operator?: Operator,
    right?: unknown,
    and?: "AND",
    upper?: unknown
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#where("AND", left, operator, right, and, upper);
  }

  /**
   * True if the item contains the attribute specified by path.
   */
  public attribute_exists(
    ...path: PathSpecArgs<T>
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(
        tokenize`attribute_exists(${this.name(...path)})`,
        "attribute_exists"
      )
    );
  }

  /**
   * True if the attribute specified by path does not exist in the item.
   */
  public attribute_not_exists(
    ...path: ObjectPaths<T>
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(
        tokenize`attribute_not_exists(${this.name(...path)})`,
        "attribute_not_exists"
      )
    );
  }

  /**
   * True if the attribute at the specified path is of a particular data type.
   */
  public attribute_type(
    path: ObjectPaths<T> | ObjectPaths<T>[0],
    type: Exclude<keyof AttributeValue, `$${string}`>
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(
        tokenize`attribute_type(${this.name(path)}, ${this.value(type)})`,
        "attribute_type"
      )
    );
  }

  /**
   * True if the attribute specified by path begins with a particular substring.
   */
  public begins_with(
    path: ObjectPaths<T> | ObjectPaths<T>[0],
    prefix: string
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(
        tokenize`begins_with(${this.name(path)}, ${this.value(prefix)})`,
        "begins_with"
      )
    );
  }

  /**
   * True if the attribute specified by path is one of the following:
   *
   * - A String that contains a particular substring
   * - A Set that contains a particular element within the set
   * - A List that contains a particular element within the list
   *
   * If the attribute specified by path is a String, the operand must be a
   * String. If the attribute specified by path is a Set, the operand must be
   * the set's element type.
   */
  public contains<K extends ObjectPaths<T> | ObjectPaths<T>[0]>(
    path: K,
    operand: ContainsArgType<PathValue<T, K>>
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(
        tokenize`contains(${this.name(path)}, ${this.value(operand)})`,
        "contains"
      )
    );
  }

  /**
   * Perform a boolean NOT on the given expression.
   */
  public not(
    expr: Expression<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#combine(
      new ExpressionBuilder(tokenize`NOT ${parens("NOT", expr)}`)
    );
  }

  /**
   * Create a clause in the expression. If this node already contains an
   * expression, it will be combined with "OR". The entire existing expression
   * is taken as the first operand of the OR, with parentheses added as
   * necessary.
   */
  public or(
    expression: ExpressionBuilder<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or(
    left: Expression<T, LogicExpressionType>,
    operator: "AND" | "OR",
    right: Expression<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<K extends PathSpec<T>>(
    left: K,
    operator: "IN",
    right: Extract<PathValue<T, K>, EqualityTypes>[]
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<V extends EqualityTypes>(
    left: Expression<T, V>,
    operator: "IN",
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<V>(
    left: Expression<T, V>,
    operator: BinaryComparisonOperator<V>,
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<K extends PathSpec<T>>(
    left: K,
    operator: BinaryComparisonOperator<PathValue<T, K>>,
    right: PathValue<T, K>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<K extends PathSpec<T>>(
    left: K,
    operator: "BETWEEN",
    lower: Extract<PathValue<T, K>, ComparisonTypes>,
    and: "AND",
    upper: Extract<PathValue<T, K>, ComparisonTypes>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or<V extends ComparisonTypes>(
    left: Expression<T, V>,
    operator: "BETWEEN",
    lower: Expression<T, V>,
    and: "AND",
    upper: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public or(
    left: PathSpec<T> | Expression<T>,
    operator?: Operator,
    right?: unknown,
    and?: "AND",
    upper?: unknown
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#where("OR", left, operator, right, and, upper);
  }

  /**
   * Returns a number that represents an attribute's size.
   */
  public size(...path: PathSpecArgs<T>): ExpressionBuilder<T, number> {
    if (this.tokens.length > 0) {
      throw new TypeError("this expression is not chainable");
    }
    return new ExpressionBuilder(tokenize`size(${this.name(...path)})`, "size");
  }

  /**
   * Create a clause in the expression. If this node already contains an
   * expression, it will be combined with "AND". The entire existing expression
   * is taken as the first operand of the AND, with parentheses added as
   * necessary. Alias for {@link and}.
   */
  public where(
    expression: ExpressionBuilder<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where(
    left: Expression<T, LogicExpressionType>,
    operator: "AND" | "OR",
    right: Expression<T, LogicExpressionType>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<K extends PathSpec<T>>(
    left: K,
    operator: "IN",
    right: Extract<PathValue<T, K>, EqualityTypes>[]
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<V extends EqualityTypes>(
    left: Expression<T, V>,
    operator: "IN",
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<V>(
    left: Expression<T, V>,
    operator: BinaryComparisonOperator<V>,
    right: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<K extends PathSpec<T>>(
    left: K,
    operator: BinaryComparisonOperator<PathValue<T, K>>,
    right: PathValue<T, K>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<K extends PathSpec<T>>(
    left: K,
    operator: "BETWEEN",
    lower: Extract<PathValue<T, K>, ComparisonTypes>,
    and: "AND",
    upper: Extract<PathValue<T, K>, ComparisonTypes>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where<V extends ComparisonTypes>(
    left: Expression<T, V>,
    operator: "BETWEEN",
    lower: Expression<T, V>,
    and: "AND",
    upper: Expression<T, V>
  ): ExpressionBuilder<T, LogicExpressionType>;

  public where(
    left: PathSpec<T> | Expression<T>,
    operator?: Operator,
    right?: unknown,
    and?: "AND",
    upper?: unknown
  ): ExpressionBuilder<T, LogicExpressionType> {
    return this.#where("AND", left, operator, right, and, upper);
  }

  #where(
    combiningOperator: "AND" | "OR",
    left: PathSpec<T> | Expression<T>,
    operator?: Operator,
    right?: unknown,
    and?: "AND",
    upper?: unknown
  ): ExpressionBuilder<T, LogicExpressionType> {
    let expression: ExpressionBuilder<T, LogicExpressionType>;

    if (operator) {
      const leftToken = parens(operator, this.asName(left));

      if (operator === "BETWEEN") {
        // we've got a BETWEEN operator
        assert(and === "AND" && upper !== undefined);

        const rightToken = this.asValue(right);
        const upperToken = this.asValue(upper);

        expression = new ExpressionBuilder(
          tokenize`${leftToken} BETWEEN ${rightToken} AND ${upperToken}`,
          "BETWEEN"
        );
      } else {
        // we've got a binary logical operator
        assert(and === undefined && upper === undefined);
        let rightToken: Expression<T>;

        if (operator === "IN") {
          assert(Array.isArray(right));
          const values = right.map((x) => this.asValue(x));
          rightToken = joinTokens(values, ", ", "(", ")");
        } else {
          rightToken = parens(operator, this.asValue(right));
        }
        expression = new ExpressionBuilder(
          tokenize`${leftToken} ${operator} ${rightToken}`,
          operator
        );
      }
    } else {
      // we've just got a single logic expression
      assert(left instanceof ExpressionBuilder);
      expression = left as ExpressionBuilder<T, LogicExpressionType>;
    }

    return this.#combine(expression, combiningOperator);
  }

  /**
   * If this builder already has an expression, then combine it with the given
   * operator, otherwise just return the expression.
   */
  #combine(
    expression: ExpressionBuilder<T, LogicExpressionType>,
    operator: "AND" | "OR" = "AND"
  ) {
    if (this.tokens.length === 0) {
      return expression;
    }

    const left = parens(operator, this);
    const right = parens(operator, expression);

    return new ExpressionBuilder(
      tokenize`${left} ${operator} ${right}`,
      operator
    );
  }
}
