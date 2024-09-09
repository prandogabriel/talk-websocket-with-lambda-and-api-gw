import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from "@aws-sdk/client-apigatewaymanagementapi";

import { Logger } from "@aws-lambda-powertools/logger";
import { TextEncoder } from "node:util";
import { RealtimeAPIGatewayEventRequestContext } from "../@types";

export class WebsocketClientService {
  private ws: ApiGatewayManagementApiClient;
  private connectionId: string;

  constructor(
    private log: Logger,
    private requestContext?: RealtimeAPIGatewayEventRequestContext
  ) {
    const stage = this.requestContext?.stage || "local";
    const configHttp = stage.match(/local/gi) ? "http" : "https";
    const domain = requestContext?.domainName ?? "localhost:3001";
    this.log.info(`${configHttp}://${domain}`);

    this.ws = new ApiGatewayManagementApiClient({
      apiVersion: "2018-11-29",
      endpoint: `${configHttp}://${domain}`
    });
    this.connectionId = requestContext?.connectionId;
  }

  async send(msg: string | unknown, id?: string) {
    // If passed msg is object, it's parsed to JSON
    const parsed = typeof msg === "string" ? msg : JSON.stringify(msg);

    this.log.info(`Sending ${parsed} to ${id || this.connectionId}`);

    const postToConnectionCommand = new PostToConnectionCommand({
      ConnectionId: id || this.connectionId,
      Data: new TextEncoder().encode(parsed)
    });

    return this.ws.send(postToConnectionCommand);
  }

  async sendToConnectionsId(msg: string | unknown, idConnections: string[]) {
    const parsed = typeof msg === "string" ? msg : JSON.stringify(msg);
    const promisesSendMessage = idConnections.map((connectionId) => {
      this.log.info(`Sending ${parsed} to ${connectionId}`);
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: new TextEncoder().encode(parsed)
      });
      return this.ws.send(postToConnectionCommand);
    });
    return Promise.all(promisesSendMessage);
  }
}
