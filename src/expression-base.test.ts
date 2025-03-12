import type { DocumentValue } from "@propulsionworks/magneto/typed-commands";
import assert from "node:assert";
import { describe, it } from "node:test";
import {
  expr,
  ExpressionCommandBuilder,
  joinTokens,
  type Token,
} from "./expression-base.ts";

describe("module expression-base", () => {
  describe("class ExpressionCommandBuilder", () => {
    describe("build()", () => {
      it("throws TypeError if the argument is not a CompoundExpression", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        assert.throws(
          () => builder.build(expr.n("hello")),
          (err) => err instanceof TypeError
        );
      });

      it("throws TypeError if a token is an unknown type", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        assert.throws(
          () => builder.build(expr`hello ${new Date() as any}`),
          (err) => err instanceof TypeError
        );
      });

      it("joins tokens in order", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("hello")} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "hello = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });

      it("aliases names that begin with underscore", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("_hello")} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "#n0 = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeNames: { "#n0": "_hello" },
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });

      it("aliases names that are reserved words", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("as")} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "#n0 = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeNames: { "#n0": "as" },
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });

      it("formats names with array indices properly", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("arrayValue", 0)} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "arrayValue[0] = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });

      it("formats names with aliases and array indices properly", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("_array", 0)} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "#n0[0] = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeNames: { "#n0": "_array" },
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });

      it("formats deep paths properly", () => {
        const builder = new ExpressionCommandBuilder(undefined, {
          simplifyExpressions: true,
        });

        const result = builder.build(
          expr`${expr.n("_one", "two", 3, "four")} = ${expr.v("world")}`
        );

        assert.strictEqual(result, "#n0.two[3].four = :v0");

        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeNames: { "#n0": "_one" },
          ExpressionAttributeValues: { ":v0": "world" },
        });
      });
    });

    describe("get maps", () => {
      it("returns ExpressionAttributeNames if present", () => {
        const builder = new ExpressionCommandBuilder({
          ExpressionAttributeNames: { "#one": "one" },
        });
        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeNames: {
            "#one": "one",
          },
        });
      });

      it("returns ExpressionAttributeValues if present", () => {
        const builder = new ExpressionCommandBuilder({
          ExpressionAttributeValues: { ":one": "one" },
        });
        assert.deepStrictEqual(builder.maps, {
          ExpressionAttributeValues: {
            ":one": "one",
          },
        });
      });
    });
  });

  describe("function joinTokens()", () => {
    it("joins the tokens with the given separator", () => {
      const tokens: Token<{ foo: unknown }>[] = [
        "a",
        expr.n("foo"),
        expr.v("bar"),
      ];

      const result = joinTokens(tokens, " - ", "[ ", " ]");

      assert.deepStrictEqual(result.tokens, [
        "[ ",
        tokens[0],
        " - ",
        tokens[1],
        " - ",
        tokens[2],
        " ]",
      ]);
    });
  });

  describe("function expr()", () => {
    it("joins the provided tokens in order", () => {
      const n = expr.n<DocumentValue>("id");
      const v = expr.v(1);

      const expression = expr`${n} < ${v}`;

      assert.deepStrictEqual(expression.tokens, ["", n, " < ", v, ""]);
    });
  });
});
