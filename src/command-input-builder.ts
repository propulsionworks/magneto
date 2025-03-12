import type { ReturnConsumedCapacity } from "@aws-sdk/client-dynamodb";
import type * as lib from "@propulsionworks/magneto/typed-commands";
import assert from "node:assert";
import {
  ExpressionCommandBuilder,
  type DocumentValue,
  type Expression,
  type LogicExpressionType,
} from "./expression-base.ts";
import { ExpressionBuilder } from "./expression-builder.ts";
import type { PatchType } from "./internal/type-utils.ts";
import { UpdateBuilder, type UpdateExpressionType } from "./update-builder.ts";

/**
 * A condition expression that can be built with our library.
 */
export type ConditionExpression<T extends DocumentValue> =
  | Expression<T, LogicExpressionType>
  | ((b: ExpressionBuilder<T>) => Expression<T, LogicExpressionType>);

/**
 * An update expression that can be built with our library.
 */
export type UpdateExpression<T extends DocumentValue> =
  | Expression<T, UpdateExpressionType>
  | ((b: UpdateBuilder<T>) => Expression<T, UpdateExpressionType>);

/**
 * Represents the input of a `BatchGetItem` operation.
 */
export type BatchGetCommandInput<Key extends DocumentValue> = PatchType<
  lib.BatchGetCommandInput<Key>,
  {
    RequestItems: lib.KeysAndAttributes<Key>;
  }
>;

/**
 * Represents the input of a `BatchWriteItem` operation.
 */
export type BatchWriteCommandInput<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.BatchWriteCommandInput<Key, Item>,
  {
    RequestItems: lib.WriteRequest<Key, Item>[];
  }
>;

/**
 * Represents the input of a `GetItem` operation.
 */
export type GetCommandInput<Key extends DocumentValue> = Omit<
  lib.GetCommandInput<Key>,
  "TableName"
>;

/**
 * Represents the input of a `DeleteItem` operation.
 */
export type DeleteCommandInput<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.DeleteCommandInput<Key>,
  {
    ConditionExpression?: ConditionExpression<Item> | undefined;
  },
  "TableName"
>;

/**
 * Represents the input of a `PutItem` operation.
 */
export type PutCommandInput<Item extends DocumentValue> = PatchType<
  lib.PutCommandInput<Item>,
  {
    ConditionExpression?: ConditionExpression<Item> | undefined;
  },
  "TableName"
>;

/**
 * Represents the input of a `Query` operation.
 */
export type QueryInputBase<Item extends DocumentValue> = PatchType<
  lib.QueryCommandInput<Partial<Item>>,
  {
    FilterExpression?: ConditionExpression<Item> | undefined;
    KeyConditionExpression: ConditionExpression<Item>;
  },
  "TableName"
>;

/**
 * Represents the input of a `Query` operation on the primary index.
 */
export type QueryInput<Key extends DocumentValue, Item extends Key> = PatchType<
  lib.QueryCommandInput<Key>,
  {
    FilterExpression?: ConditionExpression<Item> | undefined;
    IndexName?: undefined;
    KeyConditionExpression: ConditionExpression<Key>;
  },
  "TableName"
>;

/**
 * Represents the input of a `Query` operation on a secondary index.
 */
export type QueryIndexInput<
  IndexName extends string,
  PrimaryKey extends DocumentValue,
  IndexKey extends DocumentValue,
  Item extends PrimaryKey & IndexKey,
> = {
  ConsistentRead?: boolean | undefined;
  ExclusiveStartKey?: (PrimaryKey & IndexKey) | undefined;
  FilterExpression?: ConditionExpression<Item> | undefined;
  KeyConditionExpression: ConditionExpression<IndexKey>;
  IndexName: IndexName; // can't change the optionality using PatchType
  Limit?: number | undefined;
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  ScanIndexForward?: boolean | undefined;
};

/**
 * Represents the input of a `Scan` operation.
 */
export type ScanInputBase<Item extends DocumentValue> = PatchType<
  lib.ScanCommandInput<Item>,
  {
    FilterExpression?: ConditionExpression<Item> | undefined;
  },
  "TableName"
>;

/**
 * Represents the input of a `Scan` operation on the primary index.
 */
export type ScanInput<Key extends DocumentValue, Item extends Key> = PatchType<
  lib.ScanCommandInput<Key>,
  {
    FilterExpression?: ConditionExpression<Item> | undefined;
    IndexName?: undefined;
  },
  "TableName"
>;

/**
 * Represents the input of a `Scan` operation on a secondary index.
 */
export type IndexScanInput<
  IndexName extends string,
  PrimaryKey extends DocumentValue,
  IndexKey extends DocumentValue,
  Item extends PrimaryKey & IndexKey,
> = {
  ConsistentRead?: boolean | undefined;
  ExclusiveStartKey?: (PrimaryKey & IndexKey) | undefined;
  FilterExpression?: ConditionExpression<Item> | undefined;
  IndexName: IndexName; // can't change the optionality using PatchType
  Limit?: number | undefined;
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  ScanIndexForward?: boolean | undefined;
};

/**
 * Represents a request to perform a check that an item exists or to check the condition
 * of specific attributes of the item.
 */
export type ConditionCheck<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.ConditionCheck<Key>,
  {
    ConditionExpression: ConditionExpression<Item>;
  },
  "TableName"
>;

/**
 * Represents a request to perform a `DeleteItem` operation.
 */
export type TransactDelete<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.Delete<Key>,
  {
    ConditionExpression: ConditionExpression<Item>;
  },
  "TableName"
>;

/**
 * Specifies an item and related attribute values to retrieve in a
 * `TransactGetItem` object.
 */
export type Get<Key extends DocumentValue> = Omit<lib.Get<Key>, "TableName">;

/**
 * Specifies an item to be retrieved as part of the transaction.
 */
export type TransactGetItem<Key extends DocumentValue> = {
  Get: Get<Key>;
};

/**
 */
export type TransactGetInput<Key extends DocumentValue> = PatchType<
  lib.TransactGetCommandInput<Key>,
  {
    TransactItems: TransactGetItem<Key>[];
  }
>;

/**
 * Represents a request to perform a `PutItem` operation.
 */
export type Put<Item extends DocumentValue> = PatchType<
  lib.Put<Item>,
  {
    ConditionExpression?: ConditionExpression<Item> | undefined;
  },
  "TableName"
>;

/**
 * Represents a request to perform an `UpdateItem` operation.
 */
export type Update<Key extends DocumentValue, Item extends Key> = PatchType<
  lib.Update<Key>,
  {
    ConditionExpression?: ConditionExpression<Item> | undefined;
    UpdateExpression: UpdateExpression<Item>;
  },
  "TableName"
>;

/**
 */
export type ConditionCheckTransactWriteItem<
  Key extends DocumentValue,
  Item extends Key,
> = {
  ConditionCheck: ConditionCheck<Key, Item>;
};

/**
 */
export type DeleteTransactWriteItem<
  Key extends DocumentValue,
  Item extends Key,
> = {
  Delete: TransactDelete<Key, Item>;
};

/**
 */
export type PutTransactWriteItem<Item extends DocumentValue> = {
  Put: Put<Item>;
};

/**
 */
export type UpdateTransactWriteItem<
  Key extends DocumentValue,
  Item extends Key,
> = {
  Update: Update<Key, Item>;
};

/**
 * A list of requests that can perform update, put, delete, or check operations
 * on multiple items in one or more tables atomically.
 */
export type TransactWriteItem<Key extends DocumentValue, Item extends Key> =
  | ConditionCheckTransactWriteItem<Key, Item>
  | DeleteTransactWriteItem<Key, Item>
  | PutTransactWriteItem<Item>
  | UpdateTransactWriteItem<Key, Item>;

/**
 */
export type TransactWriteInput<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.TransactWriteCommandInput<Key, Item>,
  {
    TransactItems: TransactWriteItem<Key, Item>[];
  }
>;

/**
 * Represents the input of an `UpdateItem` operation.
 */
export type UpdateCommandInput<
  Key extends DocumentValue,
  Item extends Key,
> = PatchType<
  lib.UpdateCommandInput<Key>,
  {
    ConditionExpression?: ConditionExpression<Item> | undefined;
    UpdateExpression: UpdateExpression<Item>;
  },
  "TableName"
>;

/**
 * Options for {@link CommandInputBuilder}.
 */
export type CommandInputBuilderOptions = {
  tableName: string;
};

/**
 * A builder class which can create inputs for typed DynamoDB commands,
 * automatically supplying a table name from the builder options.
 */
export class CommandInputBuilder<
  Item extends DocumentValue,
  PrimaryKey extends keyof Item,
  Indices extends Record<string, string> = Record<string, never>,
> {
  readonly #tableName: string;

  public get tableName(): string {
    return this.#tableName;
  }

  public constructor(options: CommandInputBuilderOptions) {
    this.#tableName = options.tableName;
  }

  /**
   * The BatchGetItem operation returns the attributes of one or more items from
   * one or more tables. You identify requested items by primary key.
   *
   * A single operation can retrieve up to 16 MB of data, which can contain as
   * many as 100 items. BatchGetItem returns a partial result if the response
   * size limit is exceeded, the table's provisioned throughput is exceeded,
   * more than 1MB per partition is requested, or an internal processing failure
   * occurs. If a partial result is returned, the operation returns a value for
   * `UnprocessedKeys`. You can use this value to retry the operation starting
   * with the next item to get.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html}
   */
  public batchGet<T extends Item>(
    input: BatchGetCommandInput<Pick<T, PrimaryKey>>
  ): lib.BatchGetCommandInput<Pick<T, PrimaryKey>> {
    return {
      ...input,
      RequestItems: {
        [this.tableName]: input.RequestItems,
      },
    };
  }

  /**
   * The BatchWriteItem operation puts or deletes multiple items in one or more
   * tables. A single call to BatchWriteItem can transmit up to 16MB of data
   * over the network, consisting of up to 25 item put or delete operations.
   * While individual items can be up to 400 KB once stored, it's important to
   * note that an item's representation might be greater than 400KB while being
   * sent in DynamoDB's JSON format for the API call.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html}
   */
  public batchWrite<T extends Item>(
    input: BatchWriteCommandInput<Pick<T, PrimaryKey>, T>
  ): lib.BatchWriteCommandInput<Pick<T, PrimaryKey>, T> {
    return {
      ...input,
      RequestItems: {
        [this.tableName]: input.RequestItems,
      },
    };
  }

  /**
   * Deletes a single item in a table by primary key. You can perform a
   * conditional delete operation that deletes the item if it exists, or if it
   * has an expected attribute value.
   *
   * In addition to deleting an item, you can also return the item's attribute
   * values in the same operation, using the `ReturnValues` parameter.
   *
   * Unless you specify conditions, the DeleteItem is an idempotent operation;
   * running it multiple times on the same item or attribute does not result in
   * an error response.
   *
   * Conditional deletes are useful for deleting items only if specific
   * conditions are met. If those conditions are met, DynamoDB performs the
   * delete. Otherwise, the item is not deleted.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html}
   */
  public delete<T extends Item>(
    input: DeleteCommandInput<Pick<T, PrimaryKey>, T>
  ): lib.DeleteCommandInput<Pick<T, PrimaryKey>> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      ...input,
      ConditionExpression: ExpressionBuilder.build(
        builder,
        input.ConditionExpression
      ),
      ...builder.maps,
      TableName: this.tableName,
    };
  }

  /**
   * The GetItem operation returns a set of attributes for the item with the
   * given primary key. If there is no matching item, GetItem does not return
   * any data and there will be no Item element in the response.
   *
   * GetItem provides an eventually consistent read by default. If your
   * application requires a strongly consistent read, set `ConsistentRead` to
   * true. Although a strongly consistent read might take more time than an
   * eventually consistent read, it always returns the last updated value.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html}
   */
  public get<T extends Item>(
    input: GetCommandInput<Pick<T, PrimaryKey>>
  ): lib.GetCommandInput<Pick<T, PrimaryKey>> {
    return {
      ...input,
      TableName: this.tableName,
    };
  }

  /**
   * Creates a new item, or replaces an old item with a new item. If an item
   * that has the same primary key as the new item already exists in the
   * specified table, the new item completely replaces the existing item. You
   * can perform a conditional put operation (add a new item if one with the
   * specified primary key doesn't exist), or replace an existing item if it has
   * certain attribute values. You can return the item's attribute values in the
   * same operation, using the `ReturnValues` parameter.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html}
   */
  public put<T extends Item>(
    input: PutCommandInput<T>
  ): lib.PutCommandInput<T> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      ...input,
      ConditionExpression: ExpressionBuilder.build(
        builder,
        input.ConditionExpression
      ),
      ...builder.maps,
      TableName: this.tableName,
    };
  }

  /**
   * You must provide the name of the partition key attribute and a single value
   * for that attribute. Query returns all items with that partition key value.
   * Optionally, you can provide a sort key attribute and use a comparison
   * operator to refine the search results.
   *
   * Use the `KeyConditionExpression` parameter to provide a specific value for
   * the partition key. The Query operation will return all of the items from
   * the table or index with that partition key value. You can optionally narrow
   * the scope of the Query operation by specifying a sort key value and a
   * comparison operator in `KeyConditionExpression`. To further refine the
   * Query results, you can optionally provide a `FilterExpression`. A
   * `FilterExpression` determines which items within the results should be
   * returned to you. All of the other results are discarded.
   *
   * A Query operation always returns a result set. If no matching items are
   * found, the result set will be empty. Queries that do not return results
   * consume the minimum number of read capacity units for that type of read
   * operation.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html}
   */
  public query<T extends Item>(
    input: QueryInput<Pick<T, PrimaryKey>, T>
  ): lib.QueryCommandInput<Pick<T, PrimaryKey>>;
  public query<
    T extends Item,
    IndexName extends Extract<keyof Indices, string>,
  >(
    input: QueryIndexInput<
      IndexName,
      Pick<T, PrimaryKey>,
      Pick<T, Indices[IndexName]>,
      T
    >
  ): lib.QueryCommandInput<Pick<T, Indices[IndexName]>>;
  public query<T extends Item>(
    input: QueryInputBase<T>
  ): lib.QueryCommandInput<Partial<T>>;
  public query<T extends Item>(
    input: QueryInputBase<T>
  ): lib.QueryCommandInput<Partial<T>> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      ...input,
      KeyConditionExpression: ExpressionBuilder.build(
        builder,
        input.KeyConditionExpression
      ),
      FilterExpression: ExpressionBuilder.build(
        builder,
        input.FilterExpression
      ),
      ...builder.maps,
      IndexName: input.IndexName,
      TableName: this.tableName,
    };
  }

  /**
   * The Scan operation returns one or more items and item attributes by
   * accessing every item in a table or a secondary index. To have DynamoDB
   * return fewer items, you can provide a FilterExpression operation.
   *
   * If the total size of scanned items exceeds the maximum dataset size limit
   * of 1 MB, the scan completes and results are returned to the user. The
   * `LastEvaluatedKey` value is also returned and the requestor can use the
   * `LastEvaluatedKey` to continue the scan in a subsequent operation.
   *
   * Each scan response also includes number of items that were scanned
   * (`ScannedCount`) as part of the request. If using a `FilterExpression`, a
   * scan result can result in no items meeting the criteria and the `Count`
   * will result in zero. If you did not use a `FilterExpression` in the scan
   * request, then `Count` is the same as `ScannedCount`.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html}
   */
  public scan<T extends Item>(
    input: ScanInput<Pick<T, PrimaryKey>, T>
  ): lib.ScanCommandInput<Pick<T, PrimaryKey>>;
  public scan<T extends Item, IndexName extends Extract<keyof Indices, string>>(
    input: IndexScanInput<
      IndexName,
      Pick<T, PrimaryKey>,
      Pick<T, Indices[IndexName]>,
      T
    >
  ): lib.ScanCommandInput<Pick<T, Indices[IndexName]>>;
  public scan<T extends Item>(
    input: ScanInputBase<T>
  ): lib.ScanCommandInput<Partial<T>>;
  public scan<T extends Item>(
    input: ScanInputBase<T>
  ): lib.ScanCommandInput<Partial<T>> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      ...input,
      FilterExpression: ExpressionBuilder.build(
        builder,
        input.FilterExpression
      ),
      ...builder.maps,
      TableName: this.tableName,
    };
  }

  /**
   * TransactGetItems is a synchronous operation that atomically retrieves
   * multiple items from one or more tables (but not from indexes) in a single
   * account and Region. A TransactGetItems call can contain up to 100
   * TransactGetItem objects, each of which contains a `Get` structure that
   * specifies an item to retrieve from a table in the account and Region. A
   * call to TransactGetItems cannot retrieve items from tables in more than one
   * AWS account or Region. The aggregate size of the items in the transaction
   * cannot exceed 4 MB.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactGetItems.html}
   */
  public transactGet<T extends Item>(
    input: TransactGetInput<Pick<T, PrimaryKey>>
  ): lib.TransactGetCommandInput<Pick<T, PrimaryKey>> {
    return {
      ...input,
      TransactItems: input.TransactItems.map(({ Get }) =>
        this.transactGetItem(Get)
      ),
    };
  }

  /**
   * Build a Transact Get operation.
   */
  public transactGetItem<T extends Item>(
    input: Get<Pick<T, PrimaryKey>>
  ): lib.TransactGetItem<Pick<T, PrimaryKey>> {
    return {
      Get: {
        ...input,
        TableName: this.tableName,
      },
    };
  }

  /**
   * Build a TransactWriteItem operation that performs a Condition Check.
   */
  public transactWriteConditionCheckItem<T extends Item>(
    input: ConditionCheck<Pick<T, PrimaryKey>, T>
  ): lib.TransactWriteItem<Pick<T, PrimaryKey>, T> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      ConditionCheck: {
        ...input,
        ConditionExpression: ExpressionBuilder.build(
          builder,
          input.ConditionExpression
        ),
        ...builder.maps,
        TableName: this.tableName,
      },
    };
  }

  /**
   * Build a TransactWriteItem operation that performs a Delete.
   */
  public transactWriteDeleteItem<T extends Item>(
    input: TransactDelete<Pick<T, PrimaryKey>, T>
  ): lib.TransactWriteItem<Pick<T, PrimaryKey>, T> {
    const { ConditionExpression: condition, ...rest } = input;
    const builder = new ExpressionCommandBuilder<T>();

    return {
      Delete: {
        ...rest,
        ConditionExpression: ExpressionBuilder.build(builder, condition),
        ...builder.maps,
        TableName: this.tableName,
      },
    };
  }

  /**
   * Build a TransactWriteItem operation that performs a Put.
   */
  public transactWritePutItem<T extends Item>(
    input: Put<T>
  ): lib.TransactWriteItem<Pick<T, PrimaryKey>, T> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      Put: {
        ...input,
        ConditionExpression: ExpressionBuilder.build(
          builder,
          input.ConditionExpression
        ),
        ...builder.maps,
        TableName: this.tableName,
      },
    };
  }

  /**
   * Build a TransactWriteItem operation that performs an Update.
   */
  public transactWriteUpdateItem<T extends Item>(
    input: Update<Pick<T, PrimaryKey>, T>
  ): lib.TransactWriteItem<Pick<T, PrimaryKey>, T> {
    const builder = new ExpressionCommandBuilder<T>();

    return {
      Update: {
        ...input,
        ConditionExpression: ExpressionBuilder.build(
          builder,
          input.ConditionExpression
        ),
        UpdateExpression: UpdateBuilder.build(builder, input.UpdateExpression),
        ...builder.maps,
        TableName: this.tableName,
      },
    };
  }

  /**
   * Build a TransactWriteItem operation.
   */
  public transactWriteItem<T extends Item>(
    input: TransactWriteItem<Pick<T, PrimaryKey>, T>
  ): lib.TransactWriteItem<Pick<T, PrimaryKey>, T> {
    if ("ConditionCheck" in input) {
      return this.transactWriteConditionCheckItem(input.ConditionCheck);
    }
    if ("Delete" in input) {
      return this.transactWriteDeleteItem(input.Delete);
    }
    if ("Put" in input) {
      return this.transactWritePutItem(input.Put);
    }
    if ("Update" in input) {
      return this.transactWriteUpdateItem(input.Update);
    }
    /* c8 ignore next */
    assert(false, "invalid transaction write item");
  }

  /**
   * TransactWriteItems is a synchronous write operation that groups up to 100
   * action requests. These actions can target items in different tables, but
   * not in different AWS accounts or Regions, and no two actions can target the
   * same item. For example, you cannot both `ConditionCheck` and `Update` the
   * same item. The aggregate size of the items in the transaction cannot exceed
   * 4 MB.
   *
   * The actions are completed atomically so that either all of them succeed, or
   * all of them fail.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html}
   */
  public transactWrite<T extends Item>(
    input: TransactWriteInput<Pick<T, PrimaryKey>, T>
  ): lib.TransactWriteCommandInput<Pick<T, PrimaryKey>, T> {
    return {
      ...input,
      TransactItems: input.TransactItems.map((item) =>
        this.transactWriteItem(item)
      ),
    };
  }

  /**
   * Edits an existing item's attributes, or adds a new item to the table if it
   * does not already exist. You can put, delete, or add attribute values. You
   * can also perform a conditional update on an existing item (insert a new
   * attribute name-value pair if it doesn't exist, or replace an existing
   * name-value pair if it has certain expected attribute values).
   *
   * You can also return the item's attribute values in the same UpdateItem
   * operation using the `ReturnValues` parameter.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html}
   */
  public update<T extends Item>(
    input: UpdateCommandInput<Pick<T, PrimaryKey>, T>
  ): lib.UpdateCommandInput<Pick<T, PrimaryKey>> {
    const {
      ConditionExpression: condition,
      UpdateExpression: update,
      ...rest
    } = input;

    const builder = new ExpressionCommandBuilder<T>();

    return {
      ...rest,
      ConditionExpression:
        condition && ExpressionBuilder.build(builder, condition),
      UpdateExpression: UpdateBuilder.build(builder, update),
      ...builder.maps,
      TableName: this.tableName,
    };
  }
}
