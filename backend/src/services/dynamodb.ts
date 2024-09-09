import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import { Connection } from "../entities/connection";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TableName = process.env.CONNECTIONS_TABLE;

export const deleteConnection = async (connectionId: string) => {
  const deleteCommand = new DeleteCommand({
    TableName,
    Key: { connectionId }
  });

  await docClient.send(deleteCommand);
};

export const saveConnection = async (connection: Connection) => {
  await docClient.send(
    new PutCommand({
      TableName,
      Item: connection
    })
  );
};

export const findConnection = async (connectionId: string) => {
  const { Item } = await docClient.send(
    new GetCommand({
      TableName,
      Key: { connectionId }
    })
  );

  return Item;
};

export const findConnectionByRoom = async (roomKey: string) => {
  const { Items } = await docClient.send(
    new QueryCommand({
      TableName,
      IndexName: "RoomKeyIndex",
      KeyConditionExpression: "roomKey = :roomKey",
      ExpressionAttributeValues: {
        ":roomKey": { S: roomKey }
      }
    })
  );

  return Items;
};
