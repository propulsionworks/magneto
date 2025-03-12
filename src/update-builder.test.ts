import assert from "node:assert";
import { describe, it } from "node:test";
import { ExpressionCommandBuilder } from "./expression-base.ts";
import { UpdateBuilder } from "./update-builder.ts";

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

describe("module update-builder", () => {
  describe("class UpdateBuilder", () => {
    it("builds a complicated expression", () => {
      const builder = new ExpressionCommandBuilder();
      const update = new UpdateBuilder<User>();

      const result = {
        Expression: builder.build(
          update
            .set("age", update.expr("age", "+", 2))
            .set("emailVerified", true)
            .delete("permissions", new Set(["manager"]))
            .add("permissions", new Set(["admin"]))
            .remove("name")
        ),
        ...builder.maps,
      };

      assert.deepStrictEqual(result, {
        Expression:
          "ADD #n0 :v0 DELETE #n1 :v1 REMOVE #n2 SET age = (age + :v2), emailVerified = :v3",
        ExpressionAttributeNames: {
          "#n0": "permissions",
          "#n1": "permissions",
          "#n2": "name",
        },
        ExpressionAttributeValues: {
          ":v0": new Set(["admin"]),
          ":v1": new Set(["manager"]),
          ":v2": 2,
          ":v3": true,
        },
      });
    });

    describe("expr()", () => {
      it("builds an arithmetic expression like name + value", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const update = new UpdateBuilder<User>();

        const result = {
          Expression: builder.build(
            update.set("age", update.expr("age", "+", 2))
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "SET age = (age + :v0)",
          ExpressionAttributeValues: {
            ":v0": 2,
          },
        });
      });

      it("builds an arithmetic expression like value - name", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const update = new UpdateBuilder<User>();

        const result = {
          Expression: builder.build(
            update.set("age", update.expr(2, "-", "age"))
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "SET age = (:v0 - age)",
          ExpressionAttributeValues: {
            ":v0": 2,
          },
        });
      });

      it("builds a nested arithmetic expression", () => {
        const builder = new ExpressionCommandBuilder<User>();
        const update = new UpdateBuilder<User>();

        const result = {
          Expression: builder.build(
            update.set(
              "age",
              update.expr(
                update.expr("age", "-", 1),
                "+",
                update.expr("age", "-", 2)
              )
            )
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "SET age = ((age - :v0) + (age - :v1))",
          ExpressionAttributeValues: {
            ":v0": 1,
            ":v1": 2,
          },
        });
      });
    });

    describe("if_not_exists()", () => {
      it("outputs the correct expression", () => {
        const builder = new ExpressionCommandBuilder();
        const update = new UpdateBuilder<User>();

        const result = {
          Expression: builder.build(
            update.set("age", update.if_not_exists("age", 2))
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "SET age = if_not_exists(age, :v0)",
          ExpressionAttributeValues: {
            ":v0": 2,
          },
        });
      });
    });

    describe("list_append()", () => {
      it("outputs the correct expression", () => {
        const builder = new ExpressionCommandBuilder();
        const update = new UpdateBuilder<User>();

        const result = {
          Expression: builder.build(
            update.set(
              ["likes", "food"],
              update.list_append(["likes", "food"], ["pasta"])
            )
          ),
          ...builder.maps,
        };

        assert.deepStrictEqual(result, {
          Expression: "SET likes.food = list_append(likes.food, :v0)",
          ExpressionAttributeValues: {
            ":v0": ["pasta"],
          },
        });
      });
    });
  });
});
