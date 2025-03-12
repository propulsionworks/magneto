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
import {
  CommandInputBuilder,
  type BatchGetCommandInput,
  type BatchWriteCommandInput,
  type DeleteCommandInput,
  type GetCommandInput,
  type IndexScanInput,
  type PutCommandInput,
  type QueryIndexInput,
  type QueryInput,
  type QueryInputBase,
  type ScanInput,
  type ScanInputBase,
  type TransactGetInput,
  type TransactWriteInput,
  type UpdateCommandInput,
} from "./command-input-builder.ts";
import type { DocumentValue } from "./expression-base.ts";

/**
 * Options for creating a {@link CommandBuilder}.
 */
export type CommandBuilderOptions = {
  tableName: string;
};

/**
 * A builder class which can create typed DynamoDB commands, automatically
 * supplying a table name from the builder options.
 */
export class CommandBuilder<
  Item extends DocumentValue,
  PrimaryKey extends keyof Item,
  Indices extends Record<string, string> = Record<string, never>,
> {
  readonly #input: CommandInputBuilder<Item, PrimaryKey, Indices>;
  readonly #tableName: string;

  /**
   * A builder instance for building command inputs.
   */
  public get input(): CommandInputBuilder<Item, PrimaryKey, Indices> {
    return this.#input;
  }

  /**
   * The table that commands built by this instance will use.
   */
  public get tableName(): string {
    return this.#tableName;
  }

  public constructor(options: CommandBuilderOptions) {
    this.#input = new CommandInputBuilder(options);
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
  ): BatchGetCommand<Pick<T, PrimaryKey>, T> {
    return new BatchGetCommand(this.input.batchGet(input));
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
  ): BatchWriteCommand<Pick<T, PrimaryKey>, T> {
    return new BatchWriteCommand(this.input.batchWrite(input));
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
  ): DeleteCommand<Pick<T, PrimaryKey>, T> {
    return new DeleteCommand(this.input.delete(input));
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
  ): GetCommand<Pick<T, PrimaryKey>, T> {
    return new GetCommand(this.input.get(input));
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
  public put<T extends Item>(input: PutCommandInput<T>): PutCommand<T> {
    return new PutCommand(this.input.put(input));
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
  ): QueryCommand<Pick<T, PrimaryKey>, T>;
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
  ): QueryCommand<Pick<T, PrimaryKey | Indices[IndexName]>, T>;
  public query<T extends Item>(
    input: QueryInputBase<T>
  ): QueryCommand<Partial<T>, T>;
  public query<T extends Item>(
    input: QueryInputBase<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): QueryCommand<any, T> {
    return new QueryCommand(this.input.query(input));
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
  ): ScanCommand<Pick<T, PrimaryKey>, T>;
  public scan<T extends Item, IndexName extends Extract<keyof Indices, string>>(
    input: IndexScanInput<
      IndexName,
      Pick<T, PrimaryKey>,
      Pick<T, Indices[IndexName]>,
      T
    >
  ): ScanCommand<Pick<T, PrimaryKey | Indices[IndexName]>, T>;
  public scan<T extends Item>(
    input: ScanInputBase<T>
  ): ScanCommand<Partial<T>, T>;
  public scan<T extends Item>(
    input: ScanInputBase<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ScanCommand<any, T> {
    return new ScanCommand(this.input.scan<T>(input));
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
  ): TransactGetCommand<Pick<T, PrimaryKey>, T> {
    return new TransactGetCommand(this.input.transactGet(input));
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
  ): TransactWriteCommand<Pick<T, PrimaryKey>, T> {
    return new TransactWriteCommand(this.input.transactWrite(input));
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
  ): UpdateCommand<Pick<T, PrimaryKey>, T> {
    return new UpdateCommand(this.input.update(input));
  }
}
