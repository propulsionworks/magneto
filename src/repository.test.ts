import {
  BatchWriteCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactGetCommand,
  TransactWriteCommand,
  UpdateCommand,
  type BatchGetCommandOutput,
  type BatchWriteCommandOutput,
  type QueryCommandOutput,
  type ScanCommandOutput,
  type TransactGetCommandOutput,
  type UpdateCommandOutput,
} from "@propulsionworks/magneto/typed-commands";
import type { HttpHandlerOptions } from "@smithy/types";
import assert from "node:assert";
import { describe, it, mock } from "node:test";
import { AutoPager, Repository } from "./repository.ts";

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

describe("module repository", () => {
  describe("class Repository", () => {
    describe("get client", () => {
      it("returns the client", () => {
        const client = Symbol() as any;
        const repo = new Repository({ client, tableName: "my_table" });

        assert.strictEqual(repo.client, client);
      });
    });

    describe("get tableName", () => {
      it("returns the table name", () => {
        const client = Symbol() as any;
        const repo = new Repository({ client, tableName: "my_table" });

        assert.strictEqual(repo.tableName, "my_table");
      });
    });

    describe("batchGet()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.batchGet(
          [
            { type: "user", id: "one" },
            { type: "user", id: "two" },
          ],
          {
            ConsistentRead: true,
          },
          {
            abortSignal,
            requestTimeout: 1234,
          }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof BatchGetCommand);

        assert.deepStrictEqual(command.input, {
          RequestItems: {
            my_table: {
              Keys: [
                { type: "user", id: "one" },
                { type: "user", id: "two" },
              ],
              ConsistentRead: true,
            },
          },
        });
      });

      it("unwraps the response", async () => {
        const sendResult: BatchGetCommandOutput = {
          Responses: {
            my_table: [{ id: "one" }, { id: "two" }],
          },
          UnprocessedKeys: {
            my_table: { Keys: [{ id: "three" }, { id: "four" }] },
          },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.batchGet([{ type: "user", id: "one" }]);

        assert.deepStrictEqual(result, {
          items: [{ id: "one" }, { id: "two" }],
          unprocessed: { Keys: [{ id: "three" }, { id: "four" }] },
        });
      });
    });

    describe("batchWrite()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.batchWrite(
          [
            { DeleteRequest: { Key: { type: "user", id: "one" } } },
            { PutRequest: { Item: user } },
          ],
          {
            abortSignal,
            requestTimeout: 1234,
          }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof BatchWriteCommand);

        assert.deepStrictEqual(command.input, {
          RequestItems: {
            my_table: [
              { DeleteRequest: { Key: { type: "user", id: "one" } } },
              { PutRequest: { Item: user } },
            ],
          },
        });
      });

      it("unwraps the response", async () => {
        const sendResult: BatchWriteCommandOutput = {
          UnprocessedItems: {
            my_table: [
              { DeleteRequest: { Key: { type: "user", id: "one" } } },
              { PutRequest: { Item: user } },
            ],
          },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.batchWrite([
          { DeleteRequest: { Key: { type: "user", id: "one" } } },
          { PutRequest: { Item: user } },
        ]);

        assert.deepStrictEqual(result, {
          unprocessed: [
            { DeleteRequest: { Key: { type: "user", id: "one" } } },
            { PutRequest: { Item: user } },
          ],
        });
      });
    });

    describe("delete()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.delete(
          { type: "user", id: "two" },
          {
            ConditionExpression: (b) => b.attribute_exists("name"),
            ReturnValues: "ALL_NEW",
          },
          {
            abortSignal,
            requestTimeout: 1234,
          }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof DeleteCommand);

        assert.deepStrictEqual(command.input, {
          Key: { type: "user", id: "two" },
          ConditionExpression: "attribute_exists(#n0)",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("returns the Attributes", async () => {
        const sendResult = {
          Attributes: user,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.delete({ type: "user", id: "two" });

        assert.deepStrictEqual(result, user);
      });
    });

    describe("get()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.get(
          { type: "user", id: "two" },
          { ConsistentRead: true },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof GetCommand);

        assert.deepStrictEqual(command.input, {
          Key: { type: "user", id: "two" },
          ConsistentRead: true,
          TableName: "my_table",
        });
      });

      it("returns the Item", async () => {
        const sendResult = { Item: user };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.get({ type: "user", id: "two" });

        assert.deepStrictEqual(result, user);
      });
    });

    describe("put()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.put(
          user,
          {
            ConditionExpression: (b) => b.attribute_exists("name"),
            ReturnValues: "ALL_NEW",
          },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof PutCommand);

        assert.deepStrictEqual(command.input, {
          Item: user,
          ConditionExpression: "attribute_exists(#n0)",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
        });
      });

      it("returns the Attributes", async () => {
        const sendResult = {
          Attributes: user,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.put({ ...user, id: "two" });

        assert.deepStrictEqual(result, user);
      });
    });

    describe("query()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.query(
          (b) => b.where("type", "=", "user"),
          {
            FilterExpression: (b) => b.where("age", "<", 42),
            ScanIndexForward: false,
          },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof QueryCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          IndexName: undefined,
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

      it("returns the page data", async () => {
        const sendResult: QueryCommandOutput = {
          Items: [user],
          Count: 1,
          ScannedCount: 2,
          LastEvaluatedKey: { type: "user", id: "three" },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.query((b) => b.where("type", "=", "user"));

        assert.deepStrictEqual(result.pageItems, [user]);
        assert.strictEqual(result.scanned, 2);

        assert.deepStrictEqual(result.lastEvaluatedKey, {
          type: "user",
          id: "three",
        });
      });
    });

    describe("queryIndex()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.queryIndex(
          "gsi1",
          (b) => b.where("type", "=", "user"),
          {
            FilterExpression: (b) => b.where("age", "<", 42),
            ScanIndexForward: false,
          },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof QueryCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          IndexName: "gsi1",
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

      it("returns the page data", async () => {
        const sendResult: QueryCommandOutput = {
          Items: [user],
          Count: 1,
          ScannedCount: 2,
          LastEvaluatedKey: { type: "user", id: "three" },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.queryIndex("gsi1", (b) =>
          b.where("type", "=", "user")
        );

        assert.deepStrictEqual(result.pageItems, [user]);
        assert.strictEqual(result.scanned, 2);

        assert.deepStrictEqual(result.lastEvaluatedKey, {
          type: "user",
          id: "three",
        });
      });
    });

    describe("scan()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.scan(
          {
            FilterExpression: (b) => b.where("age", "<", 42),
          },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof ScanCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          FilterExpression: "age < :v0",
          ExpressionAttributeValues: {
            ":v0": 42,
          },
        });
      });

      it("returns the page data", async () => {
        const sendResult: ScanCommandOutput = {
          Items: [user],
          Count: 1,
          ScannedCount: 2,
          LastEvaluatedKey: { type: "user", id: "three" },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.scan();

        assert.deepStrictEqual(result.pageItems, [user]);
        assert.strictEqual(result.scanned, 2);

        assert.deepStrictEqual(result.lastEvaluatedKey, {
          type: "user",
          id: "three",
        });
      });
    });

    describe("scanIndex()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.scanIndex(
          "gsi1",
          {
            FilterExpression: (b) => b.where("age", "<", 42),
          },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof ScanCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          IndexName: "gsi1",
          FilterExpression: "age < :v0",
          ExpressionAttributeValues: {
            ":v0": 42,
          },
        });
      });

      it("returns the page data", async () => {
        const sendResult: ScanCommandOutput = {
          Items: [user],
          Count: 1,
          ScannedCount: 2,
          LastEvaluatedKey: { type: "user", id: "three" },
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.scanIndex("gsi1");

        assert.deepStrictEqual(result.pageItems, [user]);
        assert.strictEqual(result.scanned, 2);

        assert.deepStrictEqual(result.lastEvaluatedKey, {
          type: "user",
          id: "three",
        });
      });
    });

    describe("transactGet()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.transactGet(
          [
            { type: "user", id: "one" },
            { type: "user", id: "two" },
          ],
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof TransactGetCommand);

        assert.deepStrictEqual(command.input, {
          TransactItems: [
            {
              Get: { Key: { type: "user", id: "one" }, TableName: "my_table" },
            },
            {
              Get: { Key: { type: "user", id: "two" }, TableName: "my_table" },
            },
          ],
        });
      });

      it("returns the Responses", async () => {
        const sendResult: TransactGetCommandOutput = {
          Responses: [{ Item: user }, {}],
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.transactGet([
          { type: "user", id: "one" },
          { type: "user", id: "two" },
        ]);

        assert.deepStrictEqual(result, [user, undefined]);
      });
    });

    describe("transactWrite()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.transactWrite(
          [
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
          { ClientRequestToken: "super-duper-request" },
          { abortSignal, requestTimeout: 1234 }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof TransactWriteCommand);

        assert.deepStrictEqual(command.input, {
          ClientRequestToken: "super-duper-request",
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
        });
      });
    });

    describe("update()", () => {
      it("builds a command from the arguments", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        await repo.update(
          { type: "user", id: "one" },
          (b) => b.set("emailVerified", true),
          {
            ConditionExpression: (b) => b.attribute_exists("name"),
            ReturnValues: "ALL_NEW",
          },
          {
            abortSignal,
            requestTimeout: 1234,
          }
        );

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof UpdateCommand);

        assert.deepStrictEqual(command.input, {
          Key: { type: "user", id: "one" },
          ConditionExpression: "attribute_exists(#n0)",
          UpdateExpression: "SET emailVerified = :v0",
          ReturnValues: "ALL_NEW",
          TableName: "my_table",
          ExpressionAttributeNames: { "#n0": "name" },
          ExpressionAttributeValues: { ":v0": true },
        });
      });

      it("returns the Attributes", async () => {
        const sendResult: UpdateCommandOutput = {
          Attributes: user,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const repo = new Repository<
          User,
          "id" | "type",
          { gsi1: "type" | "index1" }
        >({ client, tableName: "my_table" });

        const result = await repo.update({ type: "user", id: "two" }, (b) =>
          b.set("emailVerified", true)
        );

        assert.deepStrictEqual(result, user);
      });
    });
  });

  describe("class AutoPager", () => {
    describe("pages()", () => {
      it("uses a ScanCommand if KeyConditionExpression is not given", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(
          client,
          {
            TableName: "my_table",
            FilterExpression: "attribute_exists(age)",
          },
          undefined,
          { abortSignal, requestTimeout: 1234 }
        );

        await toArray(pager.pages());

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof ScanCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          ExclusiveStartKey: undefined,
          FilterExpression: "attribute_exists(age)",
        });
      });

      it("uses a QueryCommand if KeyConditionExpression is given", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const abortSignal = AbortSignal.timeout(1000);
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(
          client,
          {
            TableName: "my_table",
            FilterExpression: "attribute_exists(age)",
            KeyConditionExpression: "age = :v0",
          },
          undefined,
          { abortSignal, requestTimeout: 1234 }
        );

        await toArray(pager.pages());

        assert.strictEqual(send.mock.callCount(), 1);

        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.abortSignal,
          abortSignal
        );
        assert.strictEqual(
          send.mock.calls[0]?.arguments[1]?.requestTimeout,
          1234
        );

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof QueryCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          ExclusiveStartKey: undefined,
          FilterExpression: "attribute_exists(age)",
          KeyConditionExpression: "age = :v0",
        });
      });

      it("returns pages until LastEvaluatedKey is undefined", async () => {
        const sendResult: ScanCommandOutput = {
          ScannedCount: 2,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(client, { TableName: "my_table" });
        const iterator = pager.pages()[Symbol.asyncIterator]();

        sendResult.Items = [{ id: "one" }, { id: "two" }];
        sendResult.LastEvaluatedKey = { id: "two" };

        const page1 = (await iterator.next()).value;

        sendResult.Items = [{ id: "three" }, { id: "four" }];
        sendResult.LastEvaluatedKey = { id: "four" };

        const page2 = (await iterator.next()).value;

        sendResult.Items = [{ id: "five" }, { id: "six" }];
        sendResult.LastEvaluatedKey = undefined;

        const page3 = (await iterator.next()).value;

        const final = await iterator.next();
        assert.strictEqual(final.done, true);

        assert.strictEqual(send.mock.callCount(), 3);

        const command1 = send.mock.calls[0]?.arguments[0];
        assert(command1 instanceof ScanCommand);

        assert.deepStrictEqual(command1.input, {
          TableName: "my_table",
          ExclusiveStartKey: undefined,
        });

        const command2 = send.mock.calls[1]?.arguments[0];
        assert(command2 instanceof ScanCommand);

        assert.deepStrictEqual(command2.input, {
          TableName: "my_table",
          ExclusiveStartKey: { id: "two" },
        });

        const command3 = send.mock.calls[2]?.arguments[0];
        assert(command3 instanceof ScanCommand);

        assert.deepStrictEqual(command3.input, {
          TableName: "my_table",
          ExclusiveStartKey: { id: "four" },
        });

        assert.deepStrictEqual(page1, {
          lastEvaluatedKey: { id: "two" },
          pageItems: [{ id: "one" }, { id: "two" }],
          scanned: 2,
        });

        assert.deepStrictEqual(page2, {
          lastEvaluatedKey: { id: "four" },
          pageItems: [{ id: "three" }, { id: "four" }],
          scanned: 2,
        });

        assert.deepStrictEqual(page3, {
          lastEvaluatedKey: undefined,
          pageItems: [{ id: "five" }, { id: "six" }],
          scanned: 2,
        });
      });

      it("uses the first page from cache if given", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(
          client,
          { TableName: "my_table" },
          {
            pageItems: [{ id: "one" }],
            lastEvaluatedKey: { id: "one" },
            scanned: 2,
          }
        );

        const pages = await toArray(pager.pages());

        assert.deepStrictEqual(pages, [
          {
            pageItems: [{ id: "one" }],
            lastEvaluatedKey: { id: "one" },
            scanned: 2,
          },
          {
            pageItems: [],
            lastEvaluatedKey: undefined,
            scanned: 0,
          },
        ]);

        assert.strictEqual(send.mock.callCount(), 1);

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof ScanCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          ExclusiveStartKey: { id: "one" },
        });
      });

      it("doesn't request a second page if the cached first page has no LastEvaluatedKey value", async () => {
        const sendResult = {};
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(
          client,
          { TableName: "my_table" },
          {
            pageItems: [{ id: "one" }],
            scanned: 2,
          }
        );

        const pages = await toArray(pager.pages());

        assert.deepStrictEqual(pages, [
          {
            pageItems: [{ id: "one" }],
            scanned: 2,
          },
        ]);

        assert.strictEqual(send.mock.callCount(), 0);
      });

      it("re-requests the first page on the next iteration", async () => {
        const sendResult: ScanCommandOutput = {
          Items: [{ id: "one" }],
          ScannedCount: 2,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(
          client,
          { TableName: "my_table" },
          {
            pageItems: [{ id: "one" }],
            lastEvaluatedKey: undefined,
            scanned: 2,
          }
        );

        // do it twice to trigger the re-request
        await toArray(pager.pages());
        const pages = await toArray(pager.pages());

        assert.deepStrictEqual(pages, [
          {
            pageItems: [{ id: "one" }],
            lastEvaluatedKey: undefined,
            scanned: 2,
          },
        ]);

        assert.strictEqual(send.mock.callCount(), 1);

        const command = send.mock.calls[0]?.arguments[0];
        assert(command instanceof ScanCommand);

        assert.deepStrictEqual(command.input, {
          TableName: "my_table",
          ExclusiveStartKey: undefined,
        });
      });
    });

    describe("[Symbol.asyncIterator]", () => {
      it("requests pages as needed until all the data is loaded", async () => {
        const sendResult: ScanCommandOutput = {
          ScannedCount: 2,
        };
        const send = mock.fn((command: unknown, options: HttpHandlerOptions) =>
          Promise.resolve(sendResult)
        );
        const client = { send } as unknown as DynamoDBDocumentClient;

        const pager = new AutoPager(client, { TableName: "my_table" });
        const iterator = pager[Symbol.asyncIterator]();
        const items: any[] = [];

        sendResult.Items = [{ id: "one" }, { id: "two" }];
        sendResult.LastEvaluatedKey = { id: "two" };

        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 1);
        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 1);

        sendResult.Items = [{ id: "three" }, { id: "four" }];
        sendResult.LastEvaluatedKey = { id: "four" };

        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 2);
        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 2);

        sendResult.Items = [{ id: "five" }, { id: "six" }];
        sendResult.LastEvaluatedKey = undefined;

        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 3);
        items.push((await iterator.next()).value);
        assert.strictEqual(send.mock.callCount(), 3);

        const final = await iterator.next();
        assert.strictEqual(final.done, true);

        assert.deepStrictEqual(items, [
          { id: "one" },
          { id: "two" },
          { id: "three" },
          { id: "four" },
          { id: "five" },
          { id: "six" },
        ]);

        const command1 = send.mock.calls[0]?.arguments[0];
        assert(command1 instanceof ScanCommand);

        assert.deepStrictEqual(command1.input, {
          TableName: "my_table",
          ExclusiveStartKey: undefined,
        });

        const command2 = send.mock.calls[1]?.arguments[0];
        assert(command2 instanceof ScanCommand);

        assert.deepStrictEqual(command2.input, {
          TableName: "my_table",
          ExclusiveStartKey: { id: "two" },
        });

        const command3 = send.mock.calls[2]?.arguments[0];
        assert(command3 instanceof ScanCommand);

        assert.deepStrictEqual(command3.input, {
          TableName: "my_table",
          ExclusiveStartKey: { id: "four" },
        });
      });
    });
  });
});

async function toArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const item of iterable) {
    output.push(item);
  }
  return output;
}
