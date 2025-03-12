import type {
  ReturnValue,
  ReturnValuesOnConditionCheckFailure,
} from "@aws-sdk/client-dynamodb";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  QueryCommand,
  ScanCommand,
  type KeysAndAttributes,
  type QueryCommandInput,
  type QueryCommandOutput,
  type ScanCommandInput,
  type ScanCommandOutput,
  type WriteRequest,
} from "@propulsionworks/magneto/typed-commands";
import type { HttpHandlerOptions } from "@smithy/types";
import { CommandBuilder } from "./command-builder.ts";
import type {
  ConditionExpression,
  TransactWriteItem,
  UpdateExpression,
} from "./command-input-builder.ts";
import type { DocumentValue } from "./expression-base.ts";
import type { DistributedPick } from "./internal/type-utils.ts";

/**
 * Options for {@link Repository.batchGet}.
 */
export type BatchGetOptions = {
  /**
   * True to guarantee that the most recent value is returned; otherwise the
   * value might be slightly out of date. Strongly-consistent reads cost twice
   * as much as eventually-consistent reads.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html}
   */
  ConsistentRead?: boolean | undefined;
};

/**
 * Return value from {@link Repository.batchGet}.
 */
export type BatchGetResult<Key extends DocumentValue, Item extends Key> = {
  items: Item[];
  unprocessed?: KeysAndAttributes<Key> | undefined;
};

/**
 * Return value from {@link Repository.batchWrite}.
 */
export type BatchWriteResult<
  Item extends DocumentValue,
  PrimaryKey extends keyof Item,
> = {
  unprocessed?: DistributedBatchWriteRequest<Item, PrimaryKey>[] | undefined;
};

/**
 * Utility type to distribute the union in Item (if applicable).
 */
export type DistributedBatchWriteRequest<
  Item extends DocumentValue,
  PrimaryKey extends keyof Item,
> = Item extends unknown ? WriteRequest<Pick<Item, PrimaryKey>, Item> : never;

/**
 * Options for {@link Repository.delete}.
 */
export type DeleteOptions<Item extends DocumentValue> = {
  /**
   * A condition that must be true for the operation to succeed. If the
   * condition is not met, then an instance of ConditionalCheckFailedException
   * will be thrown.
   */
  ConditionExpression?: ConditionExpression<Item> | undefined;
  /**
   * Choose which values will be returned when the operation succeeds.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Set to `ALL_OLD` to include the existing values in the
   * ConditionalCheckFailedException, if the {@link ConditionExpression} is not
   * met.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
};

/**
 * Options for {@link Repository.get}.
 */
export type GetOptions = {
  /**
   * True to guarantee that the most recent value is returned; otherwise the
   * value might be slightly out of date. Strongly-consistent reads cost twice
   * as much as eventually-consistent reads.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html}
   */
  ConsistentRead?: boolean | undefined;
};

/**
 * The result of a {@link Repository.query} or {@link Repository.scan}
 * operation.
 */
export type PageResult<Key extends DocumentValue, Item extends Key> = {
  /**
   * The key of the last item evaluated by the operation. Pass this as
   * `ExclusiveStartKey` in the next request to continue reading from where you
   * left off.
   *
   * If this value is undefined, there are no more results available; otherwise,
   * there may or may not be more results.
   */
  lastEvaluatedKey?: Key | undefined;
  /**
   * The matching documents.
   */
  pageItems: Item[];
  /**
   * The total number of items evaluated. This will be equal to pageItems.length
   * if no `FilterExpression` is provided, otherwise it will be greater or
   * equal. Billing is based on number of items scanned, not number of items
   * returned.
   */
  scanned: number;
};

/**
 * Options for {@link Repository.put}.
 */
export type PutOptions<Item extends DocumentValue> = {
  /**
   * A condition that must be true for the operation to succeed. If the
   * condition is not met, then an instance of ConditionalCheckFailedException
   * will be thrown.
   */
  ConditionExpression?: ConditionExpression<Item> | undefined;
  /**
   * Choose which values will be returned when the operation succeeds.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Set to `ALL_OLD` to include the existing values in the
   * ConditionalCheckFailedException, if the {@link ConditionExpression} is not
   * met.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
};

/**
 * Options for {@link Repository.query} and {@link Repository.queryIndex}.
 */
export type QueryOptions<Key extends DocumentValue, Item extends Key> = {
  /**
   * True to guarantee that the most recent value is returned; otherwise the
   * value might be slightly out of date. Strongly-consistent reads cost twice
   * as much as eventually-consistent reads.
   *
   * Strongly consistent reads are not supported on secondary indexes.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html}
   */
  ConsistentRead?: boolean | undefined;
  /**
   * The key of the first item that this operation will evaluate. Use the value
   * that was returned for `LastEvaluatedKey` in the previous operation.
   *
   * For queries against a secondary index, the key will be comprised of the
   * index key _and_ the primary key.
   */
  ExclusiveStartKey?: Key | undefined;
  /**
   * A string that contains conditions that DynamoDB applies after the `Scan`
   * operation, but before the data is returned to you. Items that do not
   * satisfy the `FilterExpression` criteria are not returned, but are still
   * counted for billing.
   */
  FilterExpression?: ConditionExpression<Item> | undefined;
  /**
   * The maximum number of items to evaluate (not necessarily the number of
   * results, if {@link FilterExpression} is provided). DynamoDB will also stop
   * when it reaches a dataset of 1MB, if that is lower. Supply the returned
   * `LastEvaluatedKey` as {@link ExclusiveStartKey} in a subsequent operation
   * to pick up where you left off.
   */
  Limit?: number | undefined;
  /**
   * Specifies the order for index traversal: If `true` (default), the traversal
   * is performed in ascending order; if `false`, the traversal is performed in
   * descending order.
   *
   * Keys are sorted according to the Sort Key value. If the sort key is a
   * number type, it is sorted in numerical order. If it is a binary type, it
   * is sorted in unsigned-byte order. If it is a string type, it is sorted in
   * UTF-8 byte order (lexicographic).
   *
   * @see {@link https://aws.amazon.com/blogs/database/effective-data-sorting-with-amazon-dynamodb/}
   */
  ScanIndexForward?: boolean | undefined;
};

/**
 * Options for {@link Repository.scan} and {@link Repository.scanIndex}.
 */
export type ScanOptions<Key extends DocumentValue, Item extends Key> = {
  /**
   * True to guarantee that the most recent value is returned; otherwise the
   * value might be slightly out of date. Strongly-consistent reads cost twice
   * as much as eventually-consistent reads.
   *
   * Strongly consistent reads are not supported on secondary indexes.
   *
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html}
   */
  ConsistentRead?: boolean | undefined;
  /**
   * The key of the first item that this operation will evaluate. Use the value
   * that was returned for `LastEvaluatedKey` in the previous operation.
   *
   * For scans against a secondary index, the key will be comprised of the index
   * key _and_ the primary key.
   *
   * In a parallel scan, a `Scan` request that includes `ExclusiveStartKey` must
   * specify the same segment whose previous `Scan` returned the corresponding
   * value of `LastEvaluatedKey`.
   */
  ExclusiveStartKey?: Key | undefined;
  /**
   * A string that contains conditions that DynamoDB applies after the `Scan`
   * operation, but before the data is returned to you. Items that do not
   * satisfy the `FilterExpression` criteria are not returned, but are still
   * counted for billing.
   */
  FilterExpression?: ConditionExpression<Item> | undefined;
  /**
   * The maximum number of items to evaluate (not necessarily the number of
   * results, if {@link FilterExpression} is provided). DynamoDB will also stop
   * when it reaches a dataset of 1MB, if that is lower. Supply the returned
   * `LastEvaluatedKey` as {@link ExclusiveStartKey} in a subsequent operation
   * to pick up where you left off.
   */
  Limit?: number | undefined;
};

/**
 * Options for {@link Repository.transactWrite}.
 */
export type TransactWriteOptions = {
  /**
   * Providing a `ClientRequestToken` makes the call to `TransactWriteItems`
   * idempotent, meaning that multiple identical calls have the same effect as
   * one single call.
   *
   * A client request token is valid for 10 minutes after the first request that
   * uses it is completed. After 10 minutes, any request with the same client
   * token is treated as a new request.
   */
  ClientRequestToken?: string | undefined;
};

/**
 * Options for {@link Repository.update}.
 */
export type UpdateOptions<Item extends DocumentValue> = {
  /**
   * A condition that must be true for the operation to succeed. If the
   * condition is not met, then an instance of ConditionalCheckFailedException
   * will be thrown.
   */
  ConditionExpression?: ConditionExpression<Item> | undefined;
  /**
   * Choose which values will be returned when the operation succeeds.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Set to `ALL_OLD` to include the existing values in the
   * ConditionalCheckFailedException, if the {@link ConditionExpression} is not
   * met.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
};

type MapKeyArray<Keys extends DocumentValue[], Item extends DocumentValue> = {
  [K in keyof Keys]: Extract<Item, Keys[K]> | undefined;
};

/**
 * Options for creating a {@link Repository}.
 */
export type RepositoryOptions = {
  client: DynamoDBDocumentClient;
  tableName: string;
};

/**
 * A wrapper over {@link CommandBuilder} that processes DynamoDB commands on the
 * given {@link DynamoDBDocumentClient} for the given table name.
 */
export class Repository<
  Item extends DocumentValue,
  PrimaryKey extends keyof Item,
  Indices extends Record<string, string> = Record<string, never>,
> {
  readonly #command: CommandBuilder<Item, PrimaryKey, Indices>;
  readonly #client: DynamoDBDocumentClient;
  readonly #tableName: string;

  /**
   * The client that this instance sends commands to.
   */
  public get client(): DynamoDBDocumentClient {
    return this.#client;
  }

  /**
   * A builder instance for building typed DynamoDB commands.
   */
  public get command(): CommandBuilder<Item, PrimaryKey, Indices> {
    return this.#command;
  }

  /**
   * The name of the DynamoDB table that this instance targets.
   */
  public get tableName(): string {
    return this.#tableName;
  }

  public constructor(options: RepositoryOptions) {
    this.#command = new CommandBuilder(options);
    this.#client = options.client;
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
  public async batchGet<T extends DistributedPick<Item, PrimaryKey>>(
    keys: T[],
    options?: BatchGetOptions,
    requestOptions?: HttpHandlerOptions
  ): Promise<BatchGetResult<T, Extract<Item, T>>> {
    const result = await this.#client.send(
      this.command.batchGet({
        RequestItems: { ...options, Keys: keys },
      }),
      requestOptions
    );
    const items = result.Responses?.[this.tableName] ?? [];
    const unprocessed = result.UnprocessedKeys?.[this.tableName];

    return {
      items: items as Extract<Item, T>[],
      unprocessed: unprocessed?.Keys.length
        ? (unprocessed as { Keys: T[] })
        : undefined,
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
  public async batchWrite<T extends Item>(
    requests: DistributedBatchWriteRequest<T, PrimaryKey>[],
    requestOptions?: HttpHandlerOptions
  ): Promise<BatchWriteResult<T, PrimaryKey>> {
    const result = await this.#client.send(
      this.command.batchWrite({
        RequestItems: requests,
      }),
      requestOptions
    );

    const unprocessed = result.UnprocessedItems?.[this.tableName] as
      | DistributedBatchWriteRequest<T, PrimaryKey>[]
      | undefined;

    return {
      unprocessed: unprocessed?.length ? unprocessed : undefined,
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
  public async delete<T extends DistributedPick<Item, PrimaryKey>>(
    key: T,
    options?: DeleteOptions<Extract<Item, T>>,
    requestOptions?: HttpHandlerOptions
  ): Promise<Extract<Item, T> | undefined> {
    const result = await this.#client.send(
      this.command.delete({
        ...options,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        Key: key as any,
      }),
      requestOptions
    );

    return result.Attributes;
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
  public async get<T extends DistributedPick<Item, PrimaryKey>>(
    key: T,
    options?: GetOptions,
    requestOptions?: HttpHandlerOptions
  ): Promise<Extract<Item, T> | undefined> {
    const result = await this.#client.send(
      this.command.get({
        ...options,
        Key: key,
      }),
      requestOptions
    );
    return result.Item as Extract<Item, T>;
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
  public async put<T extends Item>(
    item: T,
    options?: PutOptions<T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<T | undefined> {
    const result = await this.#client.send(
      this.command.put({
        ...options,
        Item: item,
      }),
      requestOptions
    );

    return result.Attributes as Extract<Item, T> | undefined;
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
  public async query<T extends Item>(
    keyCondition: ConditionExpression<Pick<T, PrimaryKey>>,
    options?: QueryOptions<Pick<T, PrimaryKey>, T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<HybridAutoPager<Pick<T, PrimaryKey>, T>> {
    const command = this.command.query<T>({
      ...options,
      KeyConditionExpression: keyCondition,
    });
    const result = await this.#client.send(command, requestOptions);

    return new HybridAutoPager(
      this.#client,
      command.input,
      {
        lastEvaluatedKey: result.LastEvaluatedKey,
        pageItems: result.Items ?? [],
        scanned: result.ScannedCount ?? 0,
      },
      requestOptions
    );
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
  public async queryIndex<
    IndexName extends Extract<keyof Indices, string>,
    T extends Item,
  >(
    indexName: IndexName,
    keyCondition: ConditionExpression<Pick<T, Indices[IndexName]>>,
    options?: QueryOptions<Pick<T, PrimaryKey | Indices[IndexName]>, T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<HybridAutoPager<Pick<T, PrimaryKey | Indices[IndexName]>, T>> {
    const command = this.command.query<T, IndexName>({
      ...options,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
    });
    const result = await this.#client.send(command, requestOptions);

    return new HybridAutoPager(
      this.#client,
      command.input,
      {
        lastEvaluatedKey: result.LastEvaluatedKey,
        pageItems: result.Items ?? [],
        scanned: result.ScannedCount ?? 0,
      },
      requestOptions
    );
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
  public async scan<T extends Item>(
    options?: ScanOptions<Pick<T, PrimaryKey>, T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<HybridAutoPager<Pick<T, PrimaryKey>, T>> {
    const command = this.command.scan<T>(options ?? {});
    const result = await this.#client.send(command, requestOptions);

    return new HybridAutoPager(
      this.#client,
      command.input,
      {
        lastEvaluatedKey: result.LastEvaluatedKey,
        pageItems: result.Items ?? [],
        scanned: result.ScannedCount ?? 0,
      },
      requestOptions
    );
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
  public async scanIndex<
    IndexName extends Extract<keyof Indices, string>,
    T extends Item,
  >(
    indexName: IndexName,
    options?: ScanOptions<Pick<T, PrimaryKey | Indices[IndexName]>, T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<HybridAutoPager<Pick<T, PrimaryKey | Indices[IndexName]>, T>> {
    const command = this.command.scan<T, IndexName>({
      ...options,
      IndexName: indexName,
    });
    const result = await this.#client.send(command, requestOptions);

    return new HybridAutoPager(
      this.#client,
      command.input,
      {
        lastEvaluatedKey: result.LastEvaluatedKey,
        pageItems: result.Items ?? [],
        scanned: result.ScannedCount ?? 0,
      },
      requestOptions
    );
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
  public async transactGet<
    const Keys extends DistributedPick<Item, PrimaryKey>[],
  >(
    keys: Keys,
    requestOptions?: HttpHandlerOptions
  ): Promise<MapKeyArray<Keys, Item>> {
    const result = await this.#client.send(
      this.command.transactGet({
        TransactItems: keys.map((key) => ({ Get: { Key: key } })),
      }),
      requestOptions
    );
    const items = result.Responses?.map((x) => x.Item) ?? [];
    return items as MapKeyArray<Keys, Item>;
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
  public async transactWrite<T extends Item>(
    transactItems: TransactWriteItem<Pick<T, PrimaryKey>, T>[],
    options?: TransactWriteOptions,
    requestOptions?: HttpHandlerOptions
  ): Promise<void> {
    await this.#client.send(
      this.command.transactWrite({
        ...options,
        TransactItems: transactItems,
      }),
      requestOptions
    );
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
  public async update<T extends Item>(
    key: Pick<T, PrimaryKey>,
    update: UpdateExpression<T>,
    options?: UpdateOptions<T>,
    requestOptions?: HttpHandlerOptions
  ): Promise<T | undefined> {
    const result = await this.#client.send(
      this.command.update({
        ...options,
        Key: key,
        UpdateExpression: update,
      }),
      requestOptions
    );
    return result.Attributes;
  }
}

/**
 * Iterator object which can iterate through a result set, loading more pages of
 * results as needed.
 */
export class AutoPager<Key extends DocumentValue, Item extends Key>
  implements AsyncIterable<Item>
{
  readonly #client: DynamoDBDocumentClient;
  readonly #input: QueryCommandInput<Key> | ScanCommandInput<Key>;
  readonly #requestOptions: HttpHandlerOptions | undefined;
  #firstPage: PageResult<Key, Item> | undefined;

  public constructor(
    client: DynamoDBDocumentClient,
    input: QueryCommandInput<Key> | ScanCommandInput<Key>,
    firstPage?: PageResult<Key, Item>,
    requestOptions?: HttpHandlerOptions
  ) {
    this.#client = client;
    this.#firstPage = firstPage;
    this.#input = input;
    this.#requestOptions = requestOptions;
  }

  /**
   * Get an iterator that returns all the items, fetching new pages as required.
   */
  public async *[Symbol.asyncIterator](): AsyncIterator<Item, void, void> {
    yield* this.items();
  }

  /**
   * Get an iterator that returns all the items, fetching new pages as required.
   */
  public async *items(): AsyncIterable<Item, void, void> {
    for await (const page of this.pages()) {
      yield* page.pageItems;
    }
  }

  /**
   * Get an iterator which fetches the next page of results.
   */
  public async *pages(): AsyncIterable<PageResult<Key, Item>, void, void> {
    let lastKey = this.#firstPage?.lastEvaluatedKey;

    if (this.#firstPage) {
      yield this.#firstPage;
      // clear this so we start again next time
      this.#firstPage = undefined;

      if (!lastKey) {
        return;
      }
    }

    do {
      let result: QueryCommandOutput<Key, Item> | ScanCommandOutput<Key, Item>;

      if ("KeyConditionExpression" in this.#input) {
        result = await this.#client.send(
          new QueryCommand<Key, Item>({
            ...this.#input,
            ExclusiveStartKey: lastKey,
          }),
          this.#requestOptions
        );
      } else {
        result = await this.#client.send(
          new ScanCommand<Key, Item>({
            ...this.#input,
            ExclusiveStartKey: lastKey,
          }),
          this.#requestOptions
        );
      }
      lastKey = result.LastEvaluatedKey;

      yield {
        lastEvaluatedKey: lastKey,
        pageItems: result.Items ?? [],
        scanned: result.ScannedCount ?? 0,
      };
    } while (lastKey);
  }
}

/**
 * Iterator object which can iterate through a result set, loading more pages of
 * results as needed. Also represents the first page of results. Data will be
 * re-fetched each time the items or pages iterator is recreated, but the first
 * page data will not be refreshed.
 */
export class HybridAutoPager<Key extends DocumentValue, Item extends Key>
  extends AutoPager<Key, Item>
  implements PageResult<Key, Item>
{
  readonly #firstPage: PageResult<Key, Item>;

  public get lastEvaluatedKey(): Key | undefined {
    return this.#firstPage.lastEvaluatedKey;
  }

  public get pageItems(): Item[] {
    return this.#firstPage.pageItems;
  }

  public get scanned(): number {
    return this.#firstPage.scanned;
  }

  public constructor(
    client: DynamoDBDocumentClient,
    input: QueryCommandInput<Key> | ScanCommandInput<Key>,
    firstPage: PageResult<Key, Item>,
    requestOptions?: HttpHandlerOptions
  ) {
    super(client, input, firstPage, requestOptions);
    this.#firstPage = firstPage;
  }
}
