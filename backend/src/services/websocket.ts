/* eslint-disable import/no-named-as-default */
import { Logger } from "@aws-lambda-powertools/logger";
import { WebsocketAPIGatewayEvent } from "../@types";
import { WebsocketClientService } from "./websocket-client";
import {
  deleteConnection,
  findConnection,
  findConnectionByRoom,
  saveConnection
} from "./dynamodb";
import { Connection } from "../entities/connection";

export class WebsocketService {
  constructor(private log: Logger) {}

  private THREE_HOURS = 3 * 60 * 60 * 1000;

  public async onConnect(event: WebsocketAPIGatewayEvent): Promise<void> {
    const {
      requestContext: { connectionId }
    } = event;

    const joinedAt = new Date().getTime();

    this.log.info("save connection ", { connectionId, joinedAt });
    const connection: Connection = {
      connectionId,
      joinedAt,
      roomKey: connectionId,
      ttl: new Date().getTime() + this.THREE_HOURS // 3 hours in milliseconds
    };

    await saveConnection(connection);
  }

  public async onDisconnect(event: WebsocketAPIGatewayEvent): Promise<void> {
    const {
      requestContext: { connectionId }
    } = event;

    const connection = (await findConnection(connectionId)) as Connection;

    const { roomKey, nickName } = connection;

    this.log.info("delete connection ", { connectionId, roomKey, nickName });

    await deleteConnection(connectionId);

    const message = `${nickName} saiu da sala`;

    await this.notificationRoom(roomKey, message, event.requestContext);
  }

  public async joinRoom(event: WebsocketAPIGatewayEvent): Promise<void> {
    const { requestContext, body } = event;
    const { connectionId } = requestContext;
    const { roomKey, nickName } = JSON.parse(body);

    // update nickname and roomkey
    const connection = await findConnection(connectionId);

    const updatedConnection = {
      ...connection,
      roomKey,
      nickName
    } as Connection;

    await saveConnection(updatedConnection);

    const message = `${nickName}  entrou na sala`;
    await this.notificationRoom(roomKey, message, requestContext);
  }

  public async onMessage(event: WebsocketAPIGatewayEvent): Promise<void> {
    const { requestContext, body } = event;
    const { connectionId } = requestContext;
    const { roomKey, content } = JSON.parse(body);

    const connection = await findConnection(connectionId);
    const now = new Date();
    const nowFormatted = now.toTimeString().split(" ")[0];
    const message = `[${nowFormatted}] - ${connection.nickName}: ${content}`;

    await this.notificationRoom(roomKey, message, requestContext);
  }

  private async notificationRoom(
    roomKey: string,
    message: string,
    requestContext: WebsocketAPIGatewayEvent["requestContext"]
  ) {
    const connections = await findConnectionByRoom(roomKey);

    const connectionsIdFromRoom = connections.map((c) => c.connectionId.S);
    const ws = new WebsocketClientService(this.log, requestContext);

    await ws.sendToConnectionsId(message, connectionsIdFromRoom);
  }
}
