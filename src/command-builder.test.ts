import {
  BatchGetCommand,
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactGetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@propulsionworks/magneto/typed-commands";
import assert from "node:assert";
import { describe, it } from "node:test";
import { CommandBuilder } from "./command-builder.ts";

type User = {
  type: "user";
  id: string;
  index1: string;
  name: string;
  age: number;
  email: string;
  emailVerified: boolean;
  role: string;
  likes: {
    food: string[];
    music: { genre: string }[];
  };
};

const user: User = {
  type: "user",
  id: "one",
  index1: "admin",
  name: "Jimmy",
  age: 42,
  email: "jimmy@example.com",
  emailVerified: true,
  role: "admin",
  likes: {
    food: ["burgers", "chips"],
    music: [{ genre: "rock" }],
  },
};

describe("module command-builder", () => {
  describe("class CommandBuilder", () => {
    describe("get tableName", () => {
      it("returns the table name", () => {
        const builder = new CommandBuilder({ tableName: "foo" });

        assert.strictEqual(builder.tableName, "foo");
      });
    });

    describe("batchGet()", () => {
      it("converts the RequestItems structure", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.batchGet({
          RequestItems: {
            Keys: [
              { type: "user", id: "one" },
              { type: "user", id: "two" },
            ],
            ConsistentRead: true,
          },
          ReturnConsumedCapacity: "INDEXES",
        });

        assert(result instanceof BatchGetCommand);

        assert.deepStrictEqual(result.input, {
          RequestItems: {
            my_table: {
              Keys: [
                { type: "user", id: "one" },
                { type: "user", id: "two" },
              ],
              ConsistentRead: true,
            },
          },
          ReturnConsumedCapacity: "INDEXES",
        });
      });
    });

    describe("batchWrite()", () => {
      it("converts the RequestItems structure", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.batchWrite({
          RequestItems: [
            { PutRequest: { Item: user } },
            { DeleteRequest: { Key: { type: "user", id: "two" } } },
          ],
          ReturnConsumedCapacity: "INDEXES",
        });

        assert(result instanceof BatchWriteCommand);

        assert.deepStrictEqual(result.input, {
          RequestItems: {
            my_table: [
              { PutRequest: { Item: user } },
              { DeleteRequest: { Key: { type: "user", id: "two" } } },
            ],
          },
          ReturnConsumedCapacity: "INDEXES",
        });
      });
    });

    describe("delete()", () => {
      it("adds the table name and converts the condition", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.delete({
          Key: { type: "user", id: "two" },
          ConditionExpression: (b) => b.attribute_exists("name"),
          ReturnValues: "ALL_NEW",
        });

        assert(result instanceof DeleteCommand);

        assert.deepStrictEqual(result.input, {
          Key: { type: "user", id: "two" },
          ConditionExpression: "attribute_exists(#n0)",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });
    });

    describe("get()", () => {
      it("adds the table name", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.get({
          Key: { type: "user", id: "two" },
          ConsistentRead: true,
        });

        assert(result instanceof GetCommand);

        assert.deepStrictEqual(result.input, {
          Key: { type: "user", id: "two" },
          ConsistentRead: true,
          TableName: "my_table",
        });
      });
    });

    describe("put()", () => {
      it("adds the table name and converts the condition", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.put({
          Item: user,
          ConditionExpression: (b) => b.attribute_exists("name"),
          ReturnValues: "ALL_NEW",
        });

        assert(result instanceof PutCommand);

        assert.deepStrictEqual(result.input, {
          Item: user,
          ConditionExpression: "attribute_exists(#n0)",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });
    });
  });

  describe("query()", () => {
    it("adds the table name and converts the query and filter expressions", () => {
      const builder = new CommandBuilder<
        User,
        "id" | "type",
        { gsi1: "type" | "index1" }
      >({
        tableName: "my_table",
      });

      const result = builder.query({
        IndexName: "gsi1",
        KeyConditionExpression: (b) => b.where("type", "=", "user"),
        FilterExpression: (b) => b.where("age", "<", 42),
        ScanIndexForward: false,
      });

      assert(result instanceof QueryCommand);

      assert.deepStrictEqual(result.input, {
        IndexName: "gsi1",
        TableName: "my_table",
        KeyConditionExpression: "#n0 = :v0",
        FilterExpression: "age < :v1",
        ExpressionAttributeNames: {
          "#n0": "type",
        },
        ExpressionAttributeValues: {
          ":v0": "user",
          ":v1": 42,
        },
        ScanIndexForward: false,
      });
    });
  });

  describe("scan()", () => {
    it("adds the table name and converts the filter expression", () => {
      const builder = new CommandBuilder<
        User,
        "id" | "type",
        { gsi1: "type" | "index1" }
      >({
        tableName: "my_table",
      });

      const result = builder.scan({
        IndexName: "gsi1",
        FilterExpression: (b) => b.where("age", "<", 42),
        ScanIndexForward: false,
      });

      assert(result instanceof ScanCommand);

      assert.deepStrictEqual(result.input, {
        IndexName: "gsi1",
        TableName: "my_table",
        FilterExpression: "age < :v0",
        ExpressionAttributeValues: {
          ":v0": 42,
        },
        ScanIndexForward: false,
      });
    });
  });

  describe("transactGet()", () => {
    it("adds the table name to each transact item", () => {
      const builder = new CommandBuilder<
        User,
        "id" | "type",
        { gsi1: "type" | "index1" }
      >({
        tableName: "my_table",
      });

      const result = builder.transactGet({
        TransactItems: [
          { Get: { Key: { type: "user", id: "one" } } },
          { Get: { Key: { type: "user", id: "two" } } },
        ],
        ReturnConsumedCapacity: "TOTAL",
      });

      assert(result instanceof TransactGetCommand);

      assert.deepStrictEqual(result.input, {
        TransactItems: [
          { Get: { Key: { type: "user", id: "one" }, TableName: "my_table" } },
          { Get: { Key: { type: "user", id: "two" }, TableName: "my_table" } },
        ],
        ReturnConsumedCapacity: "TOTAL",
      });
    });

    describe("transactWrite()", () => {
      it("adds the table name to each transact item and converts the expressions", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.transactWrite({
          TransactItems: [
            {
              ConditionCheck: {
                Key: { type: "user", id: "one" },
                ConditionExpression: (b) => b.where("name", "=", "hello"),
              },
            },
            {
              Delete: {
                Key: { type: "user", id: "two" },
                ConditionExpression: (b) => b.where("name", "=", "hello"),
              },
            },
            {
              Put: {
                Item: user,
                ConditionExpression: (b) => b.where("type", "=", "user"),
              },
            },
            {
              Update: {
                Key: { type: "user", id: "three" },
                ConditionExpression: (b) => b.where("type", "=", "user"),
                UpdateExpression: (b) => b.set("name", "gordon"),
              },
            },
          ],
          ReturnConsumedCapacity: "TOTAL",
        });

        assert(result instanceof TransactWriteCommand);

        assert.deepStrictEqual(result.input, {
          TransactItems: [
            {
              ConditionCheck: {
                Key: { type: "user", id: "one" },
                TableName: "my_table",
                ConditionExpression: "#n0 = :v0",
                ExpressionAttributeNames: { "#n0": "name" },
                ExpressionAttributeValues: { ":v0": "hello" },
              },
            },
            {
              Delete: {
                Key: { type: "user", id: "two" },
                TableName: "my_table",
                ConditionExpression: "#n0 = :v0",
                ExpressionAttributeNames: { "#n0": "name" },
                ExpressionAttributeValues: { ":v0": "hello" },
              },
            },
            {
              Put: {
                Item: user,
                TableName: "my_table",
                ConditionExpression: "#n0 = :v0",
                ExpressionAttributeNames: { "#n0": "type" },
                ExpressionAttributeValues: { ":v0": "user" },
              },
            },
            {
              Update: {
                Key: { type: "user", id: "three" },
                TableName: "my_table",
                ConditionExpression: "#n0 = :v0",
                UpdateExpression: "SET #n1 = :v1",
                ExpressionAttributeNames: { "#n0": "type", "#n1": "name" },
                ExpressionAttributeValues: { ":v0": "user", ":v1": "gordon" },
              },
            },
          ],
          ReturnConsumedCapacity: "TOTAL",
        });
      });
    });

    describe("update()", () => {
      it("adds the table name and converts the expressions", () => {
        const builder = new CommandBuilder<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({
          tableName: "my_table",
        });

        const result = builder.update({
          Key: { type: "user", id: "one" },
          ConditionExpression: (b) => b.attribute_exists("name"),
          UpdateExpression: (b) => b.set("emailVerified", true),
          ReturnValues: "ALL_NEW",
        });

        assert(result instanceof UpdateCommand);

        assert.deepStrictEqual(result.input, {
          Key: { type: "user", id: "one" },
          ConditionExpression: "attribute_exists(#n0)",
          UpdateExpression: "SET emailVerified = :v0",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
          ExpressionAttributeValues: { ":v0": true },
        });
      });
    });
  });
});
