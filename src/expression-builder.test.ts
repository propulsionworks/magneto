import assert from "node:assert";
import { describe, it, mock } from "node:test";
import { expr, ExpressionCommandBuilder } from "./expression-base.ts";
import {
  ExpressionBuilder,
  ExpressionBuilderBase,
} from "./expression-builder.ts";

type User = {
  id: string;
  name: string;
  age: number;
  email: string;
  emailVerified: boolean;
  role: string;
  permissions: Set<string>;
  likes: {
    food: string[];
    music: { genre: string }[];
  };
};

describe("module expression-builder", () => {
  describe("class ExpressionBuilderBase", () => {
    describe("static build()", () => {
      it("returns a string argument as-is", () => {
        const builder = new ExpressionCommandBuilder();
        const result = ExpressionBuilderBase.build(builder, "hello world");
        assert.strictEqual(result, "hello world");
      });

      it("calls a builder function", () => {
        const builder = new ExpressionCommandBuilder();
        const buildMockFn = mock.method(
          builder,
          "build",
          (expr: any) => "the expression"
        );

        const exprResult = Symbol();
        const expr = mock.fn((b: any) => exprResult as any);

        class Builder {}

        const result = ExpressionBuilderBase.build(builder, expr, Builder);

        assert.strictEqual(buildMockFn.mock.callCount(), 1);
        assert.strictEqual(buildMockFn.mock.calls[0]?.arguments[0], exprResult);

        assert.strictEqual(expr.mock.callCount(), 1);
        assert(expr.mock.calls[0]?.arguments[0] instanceof Builder);
        assert.strictEqual(result, "the expression");
      });

      it("builds an expression", () => {
        const builder = new ExpressionCommandBuilder();
        const buildMockFn = mock.method(
          builder,
          "build",
          (expr: any) => "the expression"
        );

        const exprResult = expr.n("id");
        const result = ExpressionBuilderBase.build(builder, exprResult);

        assert.strictEqual(buildMockFn.mock.callCount(), 1);
        assert.strictEqual(buildMockFn.mock.calls[0]?.arguments[0], exprResult);

        assert.strictEqual(result, "the expression");
      });
    });
  });

  describe("class ExpressionBuilder", () => {
    describe("static build()", () => {
      it("returns a string argument as-is", () => {
        const builder = new ExpressionCommandBuilder();
        const result = ExpressionBuilder.build(builder, "hello world");
        assert.strictEqual(result, "hello world");
      });

      it("returns undefined as-is", () => {
        const builder = new ExpressionCommandBuilder();
        const result = ExpressionBuilder.build(builder, undefined);
        assert.strictEqual(result, undefined);
      });

      it("calls a builder function", () => {
        const builder = new ExpressionCommandBuilder();
        const buildMockFn = mock.method(
          builder,
          "build",
          (expr: any) => "the expression"
        );

        const exprResult = Symbol();
        const expr = mock.fn((b: any) => exprResult as any);

        const result = ExpressionBuilder.build(builder, expr);

        assert.strictEqual(buildMockFn.mock.callCount(), 1);
        assert.strictEqual(buildMockFn.mock.calls[0]?.arguments[0], exprResult);

        assert.strictEqual(expr.mock.callCount(), 1);
        assert(expr.mock.calls[0]?.arguments[0] instanceof ExpressionBuilder);
        assert.strictEqual(result, "the expression");
      });

      it("builds an expression", () => {
        const builder = new ExpressionCommandBuilder();
        const buildMockFn = mock.method(
          builder,
          "build",
          (expr: any) => "the expression"
        );

        const exprResult = expr.n("id");
        const result = ExpressionBuilder.build(builder, exprResult);

        assert.strictEqual(buildMockFn.mock.callCount(), 1);
        assert.strictEqual(buildMockFn.mock.calls[0]?.arguments[0], exprResult);

        assert.strictEqual(result, "the expression");
      });
    });

    describe("and()", () => {
      it("creates an equality expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(builder.and("id", "=", "abc"));

        assert.deepEqual(expression, "id = :v0");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc" },
        });
      });

      it("creates an AND expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder.and(
            builder.and("id", "=", "abc"),
            "AND",
            builder.and("age", "<", 42)
          )
        );

        assert.strictEqual(expression, "id = :v0 AND age < :v1");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc", ":v1": 42 },
        });
      });

      it("creates an AND expression with a nested OR", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder.and(
            builder.and("id", "=", "abc"),
            "AND",
            builder.and(
              builder.and("age", "<", 12),
              "OR",
              builder.and("age", ">", 82)
            )
          )
        );

        assert.strictEqual(expression, "id = :v0 AND (age < :v1 OR age > :v2)");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc", ":v1": 12, ":v2": 82 },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder
            .and("id", "=", "abc")
            .and(builder.and("age", "<", 12), "OR", builder.and("age", ">", 82))
            .and("emailVerified", "=", true)
        );

        assert.strictEqual(
          expression,
          "id = :v0 AND (age < :v1 OR age > :v2) AND emailVerified = :v3"
        );

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: {
            ":v0": "abc",
            ":v1": 12,
            ":v2": 82,
            ":v3": true,
          },
        });
      });
    });

    describe("attribute_exists()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.attribute_exists("name")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_exists(#n0)",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.attribute_exists("name").attribute_exists("role")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_exists(#n0) AND attribute_exists(#n1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
        });
      });
    });

    describe("attribute_not_exists()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.attribute_not_exists("name")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_not_exists(#n0)",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.attribute_not_exists("name").attribute_not_exists("role")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_not_exists(#n0) AND attribute_not_exists(#n1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
        });
      });
    });

    describe("attribute_type()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.attribute_type("name", "S")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_type(#n0, :v0)",
          ExpressionAttributeNames: { "#n0": "name" },
          ExpressionAttributeValues: { ":v0": "S" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.attribute_type("name", "S").attribute_type("role", "N")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "attribute_type(#n0, :v0) AND attribute_type(#n1, :v1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
          ExpressionAttributeValues: { ":v0": "S", ":v1": "N" },
        });
      });
    });

    describe("begins_with()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.begins_with("name", "blah")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "begins_with(#n0, :v0)",
          ExpressionAttributeNames: { "#n0": "name" },
          ExpressionAttributeValues: { ":v0": "blah" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.begins_with("name", "blah").begins_with("role", "foo")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "begins_with(#n0, :v0) AND begins_with(#n1, :v1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
          ExpressionAttributeValues: { ":v0": "blah", ":v1": "foo" },
        });
      });
    });

    describe("contains()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.contains("name", "blah")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "contains(#n0, :v0)",
          ExpressionAttributeNames: { "#n0": "name" },
          ExpressionAttributeValues: { ":v0": "blah" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.contains("name", "blah").contains("role", "foo")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "contains(#n0, :v0) AND contains(#n1, :v1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
          ExpressionAttributeValues: { ":v0": "blah", ":v1": "foo" },
        });
      });
    });

    describe("not()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.not(expr.attribute_exists("name"))),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "NOT attribute_exists(#n0)",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.not(expr.attribute_exists("name")).attribute_exists("role")
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "NOT attribute_exists(#n0) AND attribute_exists(#n1)",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
        });
      });

      it("adds parenthesis if necessary", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(
            expr.not(expr.attribute_exists("name").attribute_exists("role"))
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "NOT (attribute_exists(#n0) AND attribute_exists(#n1))",
          ExpressionAttributeNames: { "#n0": "name", "#n1": "role" },
        });
      });
    });

    describe("or()", () => {
      it("creates an equality expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(builder.or("id", "=", "abc"));

        assert.deepEqual(expression, "id = :v0");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc" },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder
            .where("id", "=", "abc")
            .and("age", "<", 12)
            .or(builder.where("age", ">", 82).and("emailVerified", "=", true))
        );

        assert.strictEqual(
          expression,
          "(id = :v0 AND age < :v1) OR (age > :v2 AND emailVerified = :v3)"
        );

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: {
            ":v0": "abc",
            ":v1": 12,
            ":v2": 82,
            ":v3": true,
          },
        });
      });
    });

    describe("size()", () => {
      it("builds the correct expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        const result = {
          Expression: builder.build(expr.size("name")),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "size(#n0)",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("throws a TypeError if chained", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const expr = new ExpressionBuilder<User>();

        assert.throws(
          () => builder.build(expr.size("name").size("role")),
          (error) => error instanceof TypeError
        );
      });
    });

    describe("where()", () => {
      it("creates an equality expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(builder.where("id", "=", "abc"));

        assert.deepEqual(expression, "id = :v0");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc" },
        });
      });

      it("creates a BETWEEN expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder.where("age", "BETWEEN", 18, "AND", 30)
        );

        assert.deepEqual(expression, "age BETWEEN :v0 AND :v1");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": 18, ":v1": 30 },
        });
      });

      it("creates an IN expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(builder.where("age", "IN", [16, 18, 21]));

        assert.deepEqual(expression, "age IN (:v0, :v1, :v2)");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": 16, ":v1": 18, ":v2": 21 },
        });
      });

      it("creates an AND expression", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder.where(
            builder.where("id", "=", "abc"),
            "AND",
            builder.where("age", "<", 42)
          )
        );

        assert.strictEqual(expression, "id = :v0 AND age < :v1");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc", ":v1": 42 },
        });
      });

      it("creates an AND expression with a nested OR", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder.where(
            builder.where("id", "=", "abc"),
            "AND",
            builder.where(
              builder.where("age", "<", 12),
              "OR",
              builder.where("age", ">", 82)
            )
          )
        );

        assert.strictEqual(expression, "id = :v0 AND (age < :v1 OR age > :v2)");

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: { ":v0": "abc", ":v1": 12, ":v2": 82 },
        });
      });

      it("is chainable", () => {
        const builder = new ExpressionBuilder<User>();
        const cmd = new ExpressionCommandBuilder();

        const expression = cmd.build(
          builder
            .where("id", "=", "abc")
            .where(
              builder.where("age", "<", 12),
              "OR",
              builder.where("age", ">", 82)
            )
            .where("emailVerified", "=", true)
        );

        assert.strictEqual(
          expression,
          "id = :v0 AND (age < :v1 OR age > :v2) AND emailVerified = :v3"
        );

        assert.deepStrictEqual(cmd.maps, {
          ExpressionAttributeValues: {
            ":v0": "abc",
            ":v1": 12,
            ":v2": 82,
            ":v3": true,
          },
        });
      });
    });
  });
});
