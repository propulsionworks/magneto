/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type {
  DynamoDBServiceException as __BaseException,
  AttributeValue,
  ConsumedCapacity,
  ItemCollectionMetrics,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ReturnValue,
  ReturnValuesOnConditionCheckFailure,
} from "@aws-sdk/client-dynamodb";
import type {
  DynamoDBDocumentClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "@aws-sdk/lib-dynamodb";
import {
  ExceptionOptionType as __ExceptionOptionType,
  Command,
} from "@smithy/smithy-client";
import type {
  Handler,
  HttpHandlerOptions,
  MetadataBearer,
  MiddlewareStack,
} from "@smithy/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocumentValue = Record<string, any>;
export type RawDocumentValue = Record<string, AttributeValue>;

/**
 * An ordered list of errors for each item in the request which caused the
 * transaction to get cancelled. The values of the list are ordered according to
 * the ordering of the `TransactWriteItems` request parameter. If no error
 * occurred for the associated item an error with a Null code and Null message
 * will be present.
 */
export interface CancellationReason<
  Item extends DocumentValue = DocumentValue,
> {
  /**
   * Item in the request which caused the transaction to get cancelled.
   */
  Item?: Item | undefined;
  /**
   * Status code for the result of the cancelled transaction.
   */
  Code?: string | undefined;
  /**
   * Cancellation reason message description.
   */
  Message?: string | undefined;
}
/**
 * A condition specified in the operation could not be evaluated.
 */
export declare class ConditionalCheckFailedException<
  Item extends DocumentValue = DocumentValue,
> extends __BaseException {
  readonly name: "ConditionalCheckFailedException";
  readonly $fault: "client";
  /**
   * Item which caused the `ConditionalCheckFailedException`.
   */
  Item?: Item | undefined;
  /**
   * @internal
   */
  constructor(
    opts: __ExceptionOptionType<
      ConditionalCheckFailedException,
      __BaseException
    >
  );
}
/**
 * Represents a request to perform a `DeleteItem` operation on an item.
 */
export interface DeleteRequest<Key extends DocumentValue = DocumentValue> {
  /**
   * The key of the item to delete.
   */
  Key: Key;
}
/**
 * Specifies an item and related attribute values to retrieve in a
 * `TransactGetItem` object.
 */
export interface Get<Key extends DocumentValue = DocumentValue> {
  /**
   * The key of the item to get.
   */
  Key: Key;
  /**
   * The name of the table from which to retrieve the specified item. You can
   * also provide the Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * A string that identifies one or more attributes of the specified item to
   * retrieve from the table. The attributes in the expression must be separated
   * by commas. If no attribute names are specified, then all attributes of the
   * specified item are returned. If any of the requested attributes are not
   * found, they do not appear in the result.
   */
  ProjectionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in the
   * {@link ProjectionExpression} parameter.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
}
/**
 * Represents the input of a `GetItem` operation.
 */
export interface GetCommandInput<Key extends DocumentValue = DocumentValue> {
  /**
   * The name of the table containing the requested item. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The key of the item to get.
   */
  Key: Key;
  /**
   * Determines the read consistency model: If set to `true`, then the operation
   * uses strongly consistent reads; otherwise, the operation uses eventually
   * consistent reads.
   */
  ConsistentRead?: boolean | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * A string that identifies one or more attributes to retrieve from the table.
   */
  ProjectionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
}
/**
 * Represents the output of a `GetItem` operation.
 */
export interface GetCommandOutput<Item extends DocumentValue = DocumentValue> {
  /**
   * The item matched by the `GetItem` operation, if any.
   */
  Item?: Item | undefined;
  /**
   * The capacity units consumed by the `GetItem` operation. The data returned
   * includes the total provisioned throughput consumed, along with statistics
   * for the table and any indexes involved in the operation. `ConsumedCapacity`
   * is only returned if the `ReturnConsumedCapacity` parameter was specified.
   * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html#read-operation-consumption}
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
}
/**
 * Represents a request to perform a `PutItem` operation on an item.
 */
export interface PutRequest<Item extends DocumentValue = DocumentValue> {
  /**
   * The item to store.
   */
  Item: Item;
}
/**
 * Represents a set of primary keys and, for each key, the attributes to
 * retrieve from the table.
 */
export interface KeysAndAttributes<Key extends DocumentValue = DocumentValue> {
  /**
   * The keys to get.
   */
  Keys: Key[];
  /**
   * The consistency of a read operation. If set to `true`, then a strongly
   * consistent read is used; otherwise, an eventually consistent read is used.
   */
  ConsistentRead?: boolean | undefined;
  /**
   * A string that identifies one or more attributes to retrieve from the table.
   */
  ProjectionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
}
/**
 * Specifies an item to be retrieved as part of the transaction.
 */
export interface TransactGetItem<Key extends DocumentValue = DocumentValue> {
  /**
   * Contains the primary key that identifies the item to get, together with the
   * name of the table that contains the item, and optionally the specific
   * attributes of the item to retrieve.
   */
  Get: Get<Key>;
}
/**
 * Details for the requested item.
 */
export interface ItemResponse<Item extends DocumentValue = DocumentValue> {
  /**
   * Map of attribute data consisting of the data type and attribute value.
   */
  Item?: Item | undefined;
}
/**
 */
export interface TransactGetCommandOutput<
  Item extends DocumentValue = DocumentValue,
> {
  /**
   * If the `ReturnConsumedCapacity` value was `TOTAL`, this is an array of
   * `ConsumedCapacity` objects, one for each table addressed by
   * `TransactGetItem` objects in the `TransactItems` parameter. These
   * `ConsumedCapacity` objects report the read-capacity units consumed by the
   * `TransactGetItems` call in that table.
   */
  ConsumedCapacity?: ConsumedCapacity[] | undefined;
  /**
   * An ordered array of up to 100 `ItemResponse` objects, each of which
   * corresponds to the `TransactGetItem` object in the same position in the
   * `TransactItems` array. Each `ItemResponse` object contains a Map of the
   * name-value pairs that are the projected attributes of the requested item.
   *
   * If a requested item could not be retrieved, the corresponding
   * `ItemResponse` object is `null`, or if the requested item has no projected
   * attributes, the corresponding `ItemResponse` object is an empty Map.
   */
  Responses?: ItemResponse<Item>[] | undefined;
}
/**
 * The entire transaction request was canceled.
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html#API_TransactWriteItems_Errors}
 */
export declare class TransactionCanceledException<
  Item extends DocumentValue = DocumentValue,
> extends __BaseException {
  readonly name: "TransactionCanceledException";
  readonly $fault: "client";
  Message?: string | undefined;
  /**
   * A list of cancellation reasons.
   */
  CancellationReasons?: CancellationReason<Item>[] | undefined;
  /**
   * @internal
   */
  constructor(
    opts: __ExceptionOptionType<TransactionCanceledException, __BaseException>
  );
}
/**
 * Represents the input of a `BatchGetItem` operation.
 */
export interface BatchGetCommandInput<
  Key extends DocumentValue = DocumentValue,
> {
  /**
   * A map of one or more table names or table ARNs and, for each table, a map
   * that describes one or more items to retrieve from that table. Each table
   * name or ARN can be used only once per `BatchGetItem` request.
   */
  RequestItems: Record<string, KeysAndAttributes<Key>>;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
}
/**
 */
export interface TransactGetCommandInput<
  Key extends DocumentValue = DocumentValue,
> {
  /**
   * An ordered array of up to 100 `TransactGetItem` objects, each of which
   * contains a `Get` structure.
   */
  TransactItems: TransactGetItem<Key>[];
  /**
   * A value of `TOTAL` causes consumed capacity information to be returned, and
   * a value of `NONE` prevents that information from being returned. No other
   * value is valid.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
}
/**
 */
export interface TransactWriteCommandOutput {
  /**
   * The capacity units consumed by the entire `TransactWriteItems` operation.
   * The values of the list are ordered according to the ordering of the
   * `TransactItems` request parameter.
   */
  ConsumedCapacity?: ConsumedCapacity[] | undefined;
  /**
   * A list of tables that were processed by `TransactWriteItems` and, for each
   * table, information about any item collections that were affected by
   * individual `UpdateItem`, `PutItem`, or `DeleteItem` operations.
   */
  ItemCollectionMetrics?: Record<string, ItemCollectionMetrics[]> | undefined;
}
/**
 * Represents a request to perform a check that an item exists or to check the condition
 * of specific attributes of the item.
 */
export interface ConditionCheck<Key extends DocumentValue = DocumentValue> {
  /**
   * The primary key of the item to be checked. Each element consists of an
   * attribute name and a value for that attribute.
   */
  Key: Key;
  /**
   * Name of the table for the check item request. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * A condition that must be satisfied in order for a conditional update to
   * succeed.
   */
  ConditionExpression: string;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * Use `ReturnValuesOnConditionCheckFailure` to get the item attributes if the
   * `ConditionCheck` condition fails. For
   * `ReturnValuesOnConditionCheckFailure`, the valid values are: `NONE` and
   * `ALL_OLD`.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents a request to perform a `DeleteItem` operation.
 */
export interface Delete<Key extends DocumentValue = DocumentValue> {
  /**
   * The primary key of the item to be deleted.
   */
  Key: Key;
  /**
   * Name of the table in which the item to be deleted resides. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * A condition that must be satisfied in order for a conditional delete to
   * succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * Use `ReturnValuesOnConditionCheckFailure` to get the item attributes if the
   *     `Delete` condition fails. For
   *     `ReturnValuesOnConditionCheckFailure`, the valid values are: NONE and
   * ALL_OLD.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents a request to perform a `PutItem` operation.
 */
export interface Put<Item extends DocumentValue = DocumentValue> {
  /**
   * The item to be stored.
   */
  Item: Item;
  /**
   * Name of the table in which to write the item. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * A condition that must be satisfied in order for a conditional update to
   * succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * Use `ReturnValuesOnConditionCheckFailure` to get the item attributes if the
   * `Put` condition fails. For `ReturnValuesOnConditionCheckFailure`, the valid
   * values are: `NONE` and `ALL_OLD`.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents a request to perform an `UpdateItem` operation.
 */
export interface Update<Key extends DocumentValue = DocumentValue> {
  /**
   * The primary key of the item to be updated.
   */
  Key: Key;
  /**
   * An expression that defines one or more attributes to be updated, the action
   * to be performed on them, and new value(s) for them.
   */
  UpdateExpression: string | undefined;
  /**
   * Name of the table for the `UpdateItem` request. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * A condition that must be satisfied in order for a conditional update to
   * succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * Use `ReturnValuesOnConditionCheckFailure` to get the item attributes if the
   * `Update` condition fails. For `ReturnValuesOnConditionCheckFailure`, the
   * valid values are: `NONE` and `ALL_OLD`.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents the output of a `DeleteItem` operation.
 */
export interface DeleteCommandOutput<
  Item extends DocumentValue = DocumentValue,
> {
  /**
   * A map of attribute names to `AttributeValue` objects, representing the item
   * as it appeared before the `DeleteItem` operation. This map appears in the
   * response only if `ReturnValues` was specified as `ALL_OLD` in the
   * request.
   */
  Attributes?: Item | undefined;
  /**
   * The capacity units consumed by the `DeleteItem` operation. The data
   * returned includes the total provisioned throughput consumed, along with
   * statistics for the table and any indexes involved in the operation.
   * `ConsumedCapacity` is only returned if the `ReturnConsumedCapacity`
   * parameter was specified.
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
  /**
   * Information about item collections, if any, that were affected by the
   * `DeleteItem` operation. `ItemCollectionMetrics` is only returned if the
   * `ReturnItemCollectionMetrics` parameter was specified. If the table does
   * not have any local secondary indexes, this information is not returned in
   * the response.
   */
  ItemCollectionMetrics?: ItemCollectionMetrics | undefined;
}
/**
 * Represents the output of a `PutItem` operation.
 */
export interface PutCommandOutput<Item extends DocumentValue = DocumentValue> {
  /**
   * The attribute values as they appeared before the `PutItem` operation, but
   * only if `ReturnValues` is specified as `ALL_OLD` in the request. Each
   * element consists of an attribute name and an attribute value.
   */
  Attributes?: Item | undefined;
  /**
   * The capacity units consumed by the `PutItem` operation. The data returned
   * includes the total provisioned throughput consumed, along with statistics
   * for the table and any indexes involved in the operation. `ConsumedCapacity`
   * is only returned if the `ReturnConsumedCapacity` parameter was specified.
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
  /**
   * Information about item collections, if any, that were affected by the
   * `PutItem` operation. `ItemCollectionMetrics` is only returned if the
   * `ReturnItemCollectionMetrics` parameter was specified. If the table does
   * not have any local secondary indexes, this information is not returned in
   * the response.
   */
  ItemCollectionMetrics?: ItemCollectionMetrics | undefined;
}
/**
 * Represents the output of a `Query` operation.
 */
export interface QueryCommandOutput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * An array of items that match the query criteria.
   */
  Items?: Item[] | undefined;
  /**
   * The number of items in the response. If you used a `QueryFilter` in the
   * request, then `Count` is the number of items returned after the filter was
   * applied, and `ScannedCount` is the number of matching items before the
   * filter was applied. If you did not use a filter in the request, then
   * `Count` and `ScannedCount` are the same.
   */
  Count?: number | undefined;
  /**
   * The number of items evaluated, before any `QueryFilter` is applied. A high
   * `ScannedCount` value with few, or no, `Count` results indicates an
   * inefficient `Query` operation.  If you did not use a filter in the request,
   * then `ScannedCount` is the same as `Count`.
   */
  ScannedCount?: number | undefined;
  /**
   * The primary key of the item where the operation stopped, inclusive of the
   * previous result set. Use this value to start a new operation, excluding
   * this value in the new request. If `LastEvaluatedKey` is empty, then the
   * "last page" of results has been processed and there is no more data to be
   * retrieved. If `LastEvaluatedKey` is not empty, it does not necessarily mean
   * that there is more data in the result set. The only way to know when you
   * have reached the end of the result set is when `LastEvaluatedKey` is empty.
   */
  LastEvaluatedKey?: Key | undefined;
  /**
   * The capacity units consumed by the `Query` operation. The data returned
   * includes the total provisioned throughput consumed, along with statistics
   * for the table and any indexes involved in the operation. `ConsumedCapacity`
   * is only returned if the `ReturnConsumedCapacity` parameter was specified.
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
}
/**
 * Represents the output of a `Scan` operation.
 */
export interface ScanCommandOutput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * An array of item attributes that match the scan criteria.
   */
  Items?: Item[] | undefined;
  /**
   * The number of items in the response. If you used a `QueryFilter` in the
   * request, then `Count` is the number of items returned after the filter was
   * applied, and `ScannedCount` is the number of matching items before the
   * filter was applied. If you did not use a filter in the request, then
   * `Count` and `ScannedCount` are the same.
   */
  Count?: number | undefined;
  /**
   * The number of items evaluated, before any `QueryFilter` is applied. A high
   * `ScannedCount` value with few, or no, `Count` results indicates an
   * inefficient `Query` operation.  If you did not use a filter in the request,
   * then `ScannedCount` is the same as `Count`.
   */
  ScannedCount?: number | undefined;
  /**
   * The primary key of the item where the operation stopped, inclusive of the
   * previous result set. Use this value to start a new operation, excluding
   * this value in the new request. If `LastEvaluatedKey` is empty, then the
   * "last page" of results has been processed and there is no more data to be
   * retrieved. If `LastEvaluatedKey` is not empty, it does not necessarily mean
   * that there is more data in the result set. The only way to know when you
   * have reached the end of the result set is when `LastEvaluatedKey` is empty.
   */
  LastEvaluatedKey?: Key | undefined;
  /**
   * The capacity units consumed by the `Query` operation. The data returned
   * includes the total provisioned throughput consumed, along with statistics
   * for the table and any indexes involved in the operation. `ConsumedCapacity`
   * is only returned if the `ReturnConsumedCapacity` parameter was specified.
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
}
/**
 * Represents the output of an `UpdateItem` operation.
 */
export interface UpdateCommandOutput<
  Item extends DocumentValue = DocumentValue,
> {
  /**
   * A map of attribute values as they appear before or after the `UpdateItem`
   * operation, as determined by the `ReturnValues` parameter. The `Attributes`
   * map is only present if the update was successful and `ReturnValues` was
   * specified as something other than `NONE` in the request. Each element
   * represents one attribute.
   */
  Attributes?: Item | undefined;
  /**
   * The capacity units consumed by the `UpdateItem` operation. The data
   * returned includes the total provisioned throughput consumed, along with
   * statistics for the table and any indexes involved in the operation.
   * `ConsumedCapacity` is only returned if the `ReturnConsumedCapacity`
   * parameter was specified.
   */
  ConsumedCapacity?: ConsumedCapacity | undefined;
  /**
   * Information about item collections, if any, that were affected by the
   * `UpdateItem` operation. `ItemCollectionMetrics` is only returned if the
   * `ReturnItemCollectionMetrics` parameter was specified. If the table does
   * not have any local secondary indexes, this information is not returned in
   * the response.
   */
  ItemCollectionMetrics?: ItemCollectionMetrics | undefined;
}
/**
 */
export interface DeleteWriteRequest<Key extends DocumentValue = DocumentValue> {
  /**
   * A request to perform a `DeleteItem` operation.
   */
  DeleteRequest: DeleteRequest<Key>;
}
/**
 */
export interface PutWriteRequest<Item extends DocumentValue = DocumentValue> {
  /**
   * A request to perform a `PutItem` operation.
   */
  PutRequest: PutRequest<Item>;
}
/**
 */
export type WriteRequest<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> = DeleteWriteRequest<Key> | PutWriteRequest<Item>;
/**
 * Represents the output of a `BatchGetItem` operation.
 */
export interface BatchGetCommandOutput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * A map of table name or table ARN to a list of items. Each object in
   * `Responses` consists of a table name or ARN, along with a map of attribute
   * data consisting of the data type and attribute value.
   */
  Responses?: Record<string, Item[]> | undefined;
  /**
   * A map of tables and their respective keys that were not processed with the
   * current response. The `UnprocessedKeys` value is in the same form as
   * `RequestItems`, so the value can be provided directly to a subsequent
   * `BatchGetItem` operation. For more information, see `RequestItems` in the
   * Request Parameters section.
   */
  UnprocessedKeys?: Record<string, KeysAndAttributes<Key>> | undefined;
  /**
   * The read capacity units consumed by the entire `BatchGetItem`
   * operation.
   */
  ConsumedCapacity?: ConsumedCapacity[] | undefined;
}
/**
 * Represents the input of a `Scan` operation.
 */
export interface ScanCommandInput<Key extends DocumentValue = DocumentValue> {
  /**
   * The name of the table containing the requested items or if you provide
   * `IndexName`, the name of the table to which that index belongs. You can
   * also provide the Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The name of a secondary index to scan. This index can be any local
   * secondary index or global secondary index. Note that if you use the
   * `IndexName` parameter, you must also provide `TableName`.
   */
  IndexName?: string | undefined;
  /**
   * The maximum number of items to evaluate (not necessarily the number of
   * matching items). If DynamoDB processes the number of items up to the limit
   * while processing the results, it stops the operation and returns the
   * matching values up to that point, and a key in `LastEvaluatedKey` to apply
   * in a subsequent operation, so that you can pick up where you left off.
   * Also, if the processed dataset size exceeds 1 MB before DynamoDB reaches
   * this limit, it stops the operation and returns the matching values up to
   * the limit, and a key in `LastEvaluatedKey` to apply in a subsequent
   * operation to continue the operation.
   */
  Limit?: number | undefined;
  /**
   * The primary key of the first item that this operation will evaluate. Use
   * the value that was returned for `LastEvaluatedKey` in the previous
   * operation. The data type for `ExclusiveStartKey` must be String, Number or
   * Binary. No set data types are allowed. In a parallel scan, a `Scan` request
   * that includes `ExclusiveStartKey` must specify the same segment whose
   * previous `Scan` returned the corresponding value of `LastEvaluatedKey`.
   */
  ExclusiveStartKey?: Key | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand throughput
   * consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * For a parallel `Scan` request, `TotalSegments` represents the
   * total number of segments into which the `Scan` operation will be divided. The
   * value of `TotalSegments` corresponds to the number of application workers
   * that will perform the parallel scan. For example, if you want to use four application
   * threads to scan a table or an index, specify a `TotalSegments` value of
   * 4.
   */
  TotalSegments?: number | undefined;
  /**
   * For a parallel `Scan` request, `Segment` identifies an
   * individual segment to be scanned by an application worker.
   * Segment IDs are zero-based, so the first segment is always 0. For example, if you want
   * to use four application threads to scan a table or an index, then the first thread
   * specifies a `Segment` value of 0, the second thread specifies 1, and so
   * on.
   */
  Segment?: number | undefined;
  /**
   * A string that identifies one or more attributes to retrieve from the specified table
   * or index. These attributes can include scalars, sets, or elements of a JSON document.
   * The attributes in the expression must be separated by commas.
   */
  ProjectionExpression?: string | undefined;
  /**
   * A string that contains conditions that DynamoDB applies after the `Scan`
   * operation, but before the data is returned to you. Items that do not satisfy the
   * `FilterExpression` criteria are not returned.
   */
  FilterExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * A Boolean value that determines the read consistency model during the scan:
   *
   * If `ConsistentRead` is `false`, then the data returned from `Scan` might
   * not contain the results from other recently completed write operations
   * (`PutItem`, `UpdateItem`, or `DeleteItem`).
   *
   * If `ConsistentRead` is `true`, then all of the write operations that
   * completed before the `Scan` began are guaranteed to be contained in the
   * `Scan` response.
   *
   * The default setting for `ConsistentRead` is `false`. The `ConsistentRead`
   * parameter is not supported on global secondary indexes. If you scan a
   * global secondary index with `ConsistentRead` set to true, you will receive
   * a `ValidationException`.
   */
  ConsistentRead?: boolean | undefined;
}
/**
 * Represents the input of a `BatchWriteItem` operation.
 */
export interface BatchWriteCommandInput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * A map of one or more table names or table ARNs and, for each table, a list
   * of operations to be performed (`DeleteRequest` or `PutRequest`).
   */
  RequestItems: Record<string, WriteRequest<Key, Item>[]>;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * Determines whether item collection metrics are returned. If set to `SIZE`,
   * the response includes statistics about item collections, if any, that were
   * modified during the operation are returned in the response. If set to
   * `NONE` (the default), no statistics are returned.
   */
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics | undefined;
}
/**
 * Represents the input of a `DeleteItem` operation.
 */
export interface DeleteCommandInput<Key extends DocumentValue = DocumentValue> {
  /**
   * The name of the table from which to delete the item. You can also provide
   * the Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The primary key of the item to delete.
   */
  Key: Key;
  /**
   * Use `ReturnValues` if you want to get the item attributes as they appeared
   * before they were deleted.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * Determines whether item collection metrics are returned. If set to `SIZE`,
   * the response includes statistics about item collections, if any, that were
   * modified during the operation are returned in the response. If set to
   * `NONE` (the default), no statistics are returned.
   */
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics | undefined;
  /**
   * A condition that must be satisfied in order for a conditional `DeleteItem`
   * to succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * An optional parameter that returns the item attributes for a `DeleteItem`
   * operation that failed a condition check.
   *
   * There is no additional cost associated with requesting a return value aside
   * from the small network and processing overhead of receiving a larger
   * response. No read capacity units are consumed.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents the input of a `PutItem` operation.
 */
export interface PutCommandInput<Item extends DocumentValue = DocumentValue> {
  /**
   * The name of the table to contain the item. You can also provide the Amazon
   * Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The item to store.
   */
  Item: Item;
  /**
   * Use `ReturnValues` if you want to get the item attributes as they appeared
   * before they were updated with the `PutItem` request.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * Determines whether item collection metrics are returned. If set to `SIZE`,
   * the response includes statistics about item collections, if any, that were
   * modified during the operation are returned in the response. If set to
   * `NONE` (the default), no statistics are returned.
   */
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics | undefined;
  /**
   * A condition that must be satisfied in order for a conditional `PutItem`
   * operation to succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * An optional parameter that returns the item attributes for a `PutItem`
   * operation that failed a condition check.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
/**
 * Represents the input of a `Query` operation.
 */
export interface QueryCommandInput<Key extends DocumentValue = DocumentValue> {
  /**
   * The name of the table containing the requested items. You can also provide the
   * Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The name of an index to query. This index can be any local secondary index
   * or global secondary index on the table. Note that if you use the
   * `IndexName` parameter, you must also provide `TableName.`
   *
   */
  IndexName?: string | undefined;
  /**
   * The maximum number of items to evaluate (not necessarily the number of
   * matching items). If DynamoDB processes the number of items up to the limit
   * while processing the results, it stops the operation and returns the
   * matching values up to that point, and a key in `LastEvaluatedKey` to apply
   * in a subsequent operation, so that you can pick up where you left off.
   * Also, if the processed dataset size exceeds 1 MB before DynamoDB reaches
   * this limit, it stops the operation and returns the matching values up to
   * the limit, and a key in `LastEvaluatedKey` to apply in a subsequent
   * operation to continue the operation.
   */
  Limit?: number | undefined;
  /**
   * Determines the read consistency model: If set to `true`, then the operation
   * uses strongly consistent reads; otherwise, the operation uses eventually
   * consistent reads.
   *
   * Strongly consistent reads are not supported on global secondary indexes. If
   * you query a global secondary index with `ConsistentRead` set to `true`, you
   * will receive a `ValidationException`.
   */
  ConsistentRead?: boolean | undefined;
  /**
   * Specifies the order for index traversal: If `true` (default), the traversal
   * is performed in ascending order; if `false`, the traversal is performed in
   * descending order.
   *
   * Items with the same partition key value are stored in sorted order by sort
   * key. If the sort key data type is Number, the results are stored in numeric
   * order. For type String, the results are stored in order of UTF-8 bytes. For
   * type Binary, DynamoDB treats each byte of the binary data as unsigned.
   *
   * If `ScanIndexForward` is `true`, DynamoDB returns the results in the order
   * in which they are stored (by sort key value). This is the default behavior.
   * If `ScanIndexForward` is `false`, DynamoDB reads the results in reverse
   * order by sort key value, and then returns the results to the client.
   */
  ScanIndexForward?: boolean | undefined;
  /**
   * The primary key of the first item that this operation will evaluate. Use
   * the value that was returned for `LastEvaluatedKey` in the previous
   * operation. The data type for `ExclusiveStartKey` must be String, Number, or
   * Binary. No set data types are allowed.
   */
  ExclusiveStartKey?: Key | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * A string that identifies one or more attributes to retrieve from the table.
   * These attributes can include scalars, sets, or elements of a JSON document.
   * The attributes in the expression must be separated by commas.
   */
  ProjectionExpression?: string | undefined;
  /**
   * A string that contains conditions that DynamoDB applies after the `Query`
   * operation, but before the data is returned to you. Items that do not
   * satisfy the `FilterExpression` criteria are not returned.
   *
   * A `FilterExpression` does not allow key attributes. You cannot define a
   * filter expression based on a partition key or a sort key.
   */
  FilterExpression?: string | undefined;
  /**
   * The condition that specifies the key values for items to be retrieved by
   * the `Query` action. The condition must perform an equality test on a single
   * partition key value. The condition can optionally perform one of several
   * comparison tests on a single sort key value. This allows `Query` to
   * retrieve one item with a given partition key value and sort key value, or
   * several items that have the same partition key value but different sort key
   * values.
   */
  KeyConditionExpression: string;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
}
/**
 * Represents the output of a `BatchWriteItem` operation.
 */
export interface BatchWriteCommandOutput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * A map of tables and requests against those tables that were not processed.
   * The `UnprocessedItems` value is in the same form as `RequestItems`, so you
   * can provide this value directly to a subsequent `BatchWriteItem` operation.
   * For more information, see `RequestItems` in the Request Parameters section.
   * Each `UnprocessedItems` entry consists of a table name or table ARN and,
   * for that table, a list of operations to perform (`DeleteRequest` or
   * `PutRequest`).
   */
  UnprocessedItems?: Record<string, WriteRequest<Key, Item>[]> | undefined;
  /**
   * A list of tables that were processed by `BatchWriteItem` and, for each
   * table, information about any item collections that were affected by
   * individual `DeleteItem` or `PutItem` operations.
   */
  ItemCollectionMetrics?: Record<string, ItemCollectionMetrics[]> | undefined;
  /**
   * The capacity units consumed by the entire `BatchWriteItem` operation.
   */
  ConsumedCapacity?: ConsumedCapacity[] | undefined;
}
/**
 * Represents the input of an `UpdateItem` operation.
 */
export interface UpdateCommandInput<Key extends DocumentValue = DocumentValue> {
  /**
   * The name of the table containing the item to update. You can also provide
   * the Amazon Resource Name (ARN) of the table in this parameter.
   */
  TableName: string;
  /**
   * The primary key of the item to be updated. Each element consists of an
   * attribute name and a value for that attribute.
   */
  Key: Key;
  /**
   * Use `ReturnValues` if you want to get the item attributes as they appear
   * before or after they are successfully updated.
   */
  ReturnValues?: ReturnValue | undefined;
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * Determines whether item collection metrics are returned. If set to `SIZE`,
   * the response includes statistics about item collections, if any, that were
   * modified during the operation are returned in the response. If set to
   * `NONE` (the default), no statistics are returned.
   */
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics | undefined;
  /**
   * An expression that defines one or more attributes to be updated, the action
   * to be performed on them, and new values for them.
   */
  UpdateExpression: string;
  /**
   * A condition that must be satisfied in order for a conditional update to
   * succeed.
   */
  ConditionExpression?: string | undefined;
  /**
   * One or more substitution tokens for attribute names in an expression.
   */
  ExpressionAttributeNames?: Record<string, string> | undefined;
  /**
   * One or more values that can be substituted in an expression.
   */
  ExpressionAttributeValues?: DocumentValue | undefined;
  /**
   * An optional parameter that returns the item attributes for an `UpdateItem`
   * operation that failed a condition check.
   *
   * There is no additional cost associated with requesting a return value aside
   * from the small network and processing overhead of receiving a larger
   * response. No read capacity units are consumed.
   */
  ReturnValuesOnConditionCheckFailure?:
    | ReturnValuesOnConditionCheckFailure
    | undefined;
}
export interface ConditionCheckTransactWriteItem<
  Key extends DocumentValue = DocumentValue,
> {
  /**
   * A request to perform a check item operation.
   */
  ConditionCheck: ConditionCheck<Key>;
}
export interface DeleteTransactWriteItem<
  Key extends DocumentValue = DocumentValue,
> {
  /**
   * A request to perform a `DeleteItem` operation.
   */
  Delete: Delete<Key>;
}
export interface PutTransactWriteItem<
  Item extends DocumentValue = DocumentValue,
> {
  /**
   * A request to perform a `PutItem` operation.
   */
  Put: Put<Item>;
}
export interface UpdateTransactWriteItem<
  Key extends DocumentValue = DocumentValue,
> {
  /**
   * A request to perform an `UpdateItem` operation.
   */
  Update: Update<Key>;
}
/**
 * A list of requests that can perform update, put, delete, or check operations
 * on multiple items in one or more tables atomically.
 */
export type TransactWriteItem<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> =
  | ConditionCheckTransactWriteItem<Key>
  | DeleteTransactWriteItem<Key>
  | PutTransactWriteItem<Item>
  | UpdateTransactWriteItem<Key>;
/**
 */
export interface TransactWriteCommandInput<
  Key extends DocumentValue = DocumentValue,
  Item extends Key = Key,
> {
  /**
   * An ordered array of up to 100 `TransactWriteItem` objects, each of which
   * contains a `ConditionCheck`, `Put`, `Update`, or `Delete` object. These can
   * operate on items in different tables, but the tables must reside in the
   * same Amazon Web Services account and Region, and no two of them can operate
   * on the same item.
   */
  TransactItems: TransactWriteItem<Key, Item>[];
  /**
   * Determines the level of detail about either provisioned or on-demand
   * throughput consumption that is returned in the response.
   */
  ReturnConsumedCapacity?: ReturnConsumedCapacity | undefined;
  /**
   * Determines whether item collection metrics are returned. If set to `SIZE`,
   * the response includes statistics about item collections (if any), that were
   * modified during the operation and are returned in the response. If set to
   * `NONE` (the default), no statistics are returned.
   */
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics | undefined;
  /**
   * Providing a `ClientRequestToken` makes the call to `TransactWriteItems`
   * idempotent, meaning that multiple identical calls have the same effect as
   * one single call. Although multiple identical calls using the same client
   * request token produce the same result on the server (no side effects), the
   * responses to the calls might not be the same.
   *
   * If the `ReturnConsumedCapacity` parameter is set, then the initial
   * `TransactWriteItems` call returns the amount of write capacity units
   * consumed in making the changes. Subsequent `TransactWriteItems` calls with
   * the same client token return the number of read capacity units consumed in
   * reading the item.
   *
   * A client request token is valid for 10 minutes after the first request that
   * uses it is completed. After 10 minutes, any request with the same client
   * token is treated as a new request. Do not resubmit the same request with
   * the same client token for more than 10 minutes, or the result might not be
   * idempotent. If you submit a request with the same client token but a change
   * in other parameters within the 10-minute idempotency window, DynamoDB
   * returns an `IdempotentParameterMismatch` exception.
   */
  ClientRequestToken?: string | undefined;
}

declare abstract class CommandBase<
  Input extends object,
  Output extends object,
> extends Command<
  Input,
  Output & MetadataBearer,
  DynamoDBDocumentClientResolvedConfig
> {
  override input: Input;
  constructor(input: Input);
  /**
   * @internal
   */
  resolveMiddleware(
    clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>,
    configuration: DynamoDBDocumentClientResolvedConfig,
    options?: HttpHandlerOptions
  ): Handler<Input, Output & MetadataBearer>;
}

/**
 * The `BatchGetItem` operation returns the attributes of one or more items from
 * one or more tables. You identify requested items by primary key.
 *
 * A single operation can retrieve up to 16 MB of data, which can contain as
 * many as 100 items. `BatchGetItem` returns a partial result if the response
 * size limit is exceeded, the table's provisioned throughput is exceeded, more
 * than 1MB per partition is requested, or an internal processing failure
 * occurs. If a partial result is returned, the operation returns a value for
 * `UnprocessedKeys`. You can use this value to retry the operation starting
 * with the next item to get.
 */
export declare class BatchGetCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<
  BatchGetCommandInput<Key>,
  BatchGetCommandOutput<Key, Item>
> {}

/**
 * The `BatchWriteItem` operation puts or deletes multiple items in one or more
 * tables. A single call to `BatchWriteItem` can transmit up to 16MB of data
 * over the network, consisting of up to 25 item put or delete operations. While
 * individual items can be up to 400 KB once stored, it's important to note that
 * an item's representation might be greater than 400KB while being sent in
 * DynamoDB's JSON format for the API call
 */
export declare class BatchWriteCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<
  BatchWriteCommandInput<Key, Item>,
  BatchWriteCommandOutput<Key, Item>
> {}

/**
 * Deletes a single item in a table by primary key. You can perform a
 * conditional delete operation that deletes the item if it exists, or if it has
 * an expected attribute value.
 *
 * In addition to deleting an item, you can also return the item's attribute
 * values in the same operation, using the `ReturnValues` parameter.
 *
 * Unless you specify conditions, the `DeleteItem` is an idempotent operation;
 * running it multiple times on the same item or attribute does not result in an
 * error response.
 */
export declare class DeleteCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<DeleteCommandInput<Key>, DeleteCommandOutput<Item>> {}

/**
 * The `GetItem` operation returns a set of attributes for the item with the
 * given primary key. If there is no matching item, `GetItem` does not return
 * any data and there will be no Item element in the response.
 *
 * `GetItem` provides an eventually consistent read by default. If your
 * application requires a strongly consistent read, set `ConsistentRead` to
 * true. Although a strongly consistent read might take more time than an
 * eventually consistent read, it always returns the last updated value.
 */
export declare class GetCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<GetCommandInput<Key>, GetCommandOutput<Item>> {}

/**
 * Creates a new item, or replaces an old item with a new item. If an item that
 * has the same primary key as the new item already exists in the specified
 * table, the new item completely replaces the existing item. You can perform a
 * conditional put operation (add a new item if one with the specified primary
 * key doesn't exist), or replace an existing item if it has certain attribute
 * values. You can return the item's attribute values in the same operation,
 * using the `ReturnValues` parameter.
 *
 * When you add an item, the primary key attributes are the only required
 * attributes.
 */
export declare class PutCommand<Item extends DocumentValue> extends CommandBase<
  PutCommandInput<Item>,
  PutCommandOutput<Item>
> {}

/**
 * You must provide the name of the partition key attribute and a single value
 * for that attribute. Query returns all items with that partition key value.
 * Optionally, you can provide a sort key attribute and use a comparison
 * operator to refine the search results.
 *
 * Use the `KeyConditionExpression` parameter to provide a specific value for
 * the partition key. The Query operation will return all of the items from the
 * table or index with that partition key value. You can optionally narrow the
 * scope of the Query operation by specifying a sort key value and a comparison
 * operator in `KeyConditionExpression`. To further refine the Query results,
 * you can optionally provide a FilterExpression. A FilterExpression determines
 * which items within the results should be returned to you. All of the other
 * results are discarded.
 *
 * A `Query` operation always returns a result set. If no matching items are
 * found, the result set will be empty. Queries that do not return results
 * consume the minimum number of read capacity units for that type of read
 * operation.
 */
export declare class QueryCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<QueryCommandInput<Key>, QueryCommandOutput<Key, Item>> {}

/**
 * The `Scan` operation returns one or more items and item attributes by
 * accessing every item in a table or a secondary index. To have DynamoDB return
 * fewer items, you can provide a `FilterExpression` operation.
 *
 * If the total size of scanned items exceeds the maximum dataset size limit of
 * 1 MB, the scan completes and results are returned to the user. The
 * LastEvaluatedKey value is also returned and the requestor can use the
 * LastEvaluatedKey to continue the scan in a subsequent operation. Each scan
 * response also includes number of items that were scanned (`ScannedCount`) as
 * part of the request. If using a `FilterExpression`, a scan result can result
 * in no items meeting the criteria and the Count will result in zero. If you
 * did not use a `FilterExpression` in the scan request, then `Count` is the
 * same as `ScannedCount`.
 */
export declare class ScanCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<ScanCommandInput<Key>, ScanCommandOutput<Key, Item>> {}

/**
 * `TransactGetItems` is a synchronous operation that atomically retrieves
 * multiple items from one or more tables (but not from indexes) in a single
 * account and Region. A `TransactGetItems` call can contain up to 100
 * `TransactGetItem` objects, each of which contains a Get structure that
 * specifies an item to retrieve from a table in the account and Region. A call
 * to `TransactGetItems` cannot retrieve items from tables in more than one AWS
 * account or Region. The aggregate size of the items in the transaction cannot
 * exceed 4 MB.
 */
export declare class TransactGetCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<
  TransactGetCommandInput<Key>,
  TransactGetCommandOutput<Item>
> {}

/**
 * `TransactWriteItems` is a synchronous write operation that groups up to 100
 * action requests. These actions can target items in different tables, but not
 * in different AWS accounts or Regions, and no two actions can target the same
 * item. For example, you cannot both `ConditionCheck` and Update the same item.
 * The aggregate size of the items in the transaction cannot exceed 4 MB.
 */
export declare class TransactWriteCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<
  TransactWriteCommandInput<Key, Item>,
  TransactWriteCommandOutput
> {}

/**
 * Edits an existing item's attributes, or adds a new item to the table if it
 * does not already exist. You can put, delete, or add attribute values. You can
 * also perform a conditional update on an existing item (insert a new attribute
 * name-value pair if it doesn't exist, or replace an existing name-value pair
 * if it has certain expected attribute values).
 *
 * You can also return the item's attribute values in the same `UpdateItem`
 * operation using the `ReturnValues` parameter.
 */
export declare class UpdateCommand<
  Key extends DocumentValue,
  Item extends Key,
> extends CommandBase<UpdateCommandInput<Key>, UpdateCommandOutput<Item>> {}
