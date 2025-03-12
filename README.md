# @propulsionworks/magneto

Magneto is a JavaScript library that helps you to build commands for [AWS DynamoDB](https://aws.amazon.com/dynamodb/).

```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Repository } from "@propulsionworks/magneto/repository";

type User = {
  type: "user";
  id: string;
  name: string;
  age: number;
  email: string;
};

// make an instance for User, where the primary key is comprised of
// `type` and `id`
const repo = new Repository<User, "type" | "id">({
  client: DynamoDBDocumentClient.from(new DynamoDBClient({})),
  tableName: "mytable",
});

// get a user by key
const user = await repo.get({ type: "user", id: "one" });

// update a user with a condition expression
await repo.update(
  { type: "user", id: "one" },
  (b) => b.set("age", "=", b.expr("age", "+", 1)),
  { ConditionExpression: (b) => b.attribute_exists("id").and("age", ">", 0) }
);
```

## Command Builder

You can also build commands for use with a [DynamoDBDocumentClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/Class/DynamoDBDocumentClient/) instance, using the `CommandBuilder` class.

```typescript
import { CommandBuilder } from "@propulsionworks/magneto/command-builder";

type User = {
  type: "user";
  id: string;
  name: string;
  age: number;
  email: string;
};

// make an instance for User, where the primary key is comprised of
// `type` and `id`
const builder = new CommandBuilder<User, "type" | "id">({
  tableName: "mytable",
});

// create a GetCommand
const command = builder.get({
  Key: { type: "user", id: "one" },
});
```
