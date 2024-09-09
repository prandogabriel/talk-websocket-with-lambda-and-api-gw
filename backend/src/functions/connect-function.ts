import { Response } from "../helper/response";
import { WebsocketService } from "../services/websocket-service";
import { WebsocketAPIGatewayEvent } from "./@types";
import {
  CustomResponse,
  FunctionAbstract,
} from "./abstracts/functions-abstract";

export class ConnectFunction extends FunctionAbstract<
  WebsocketAPIGatewayEvent,
  void
> {
  static instance: ConnectFunction;
  private websocketService = new WebsocketService();

  protected buildRequest(
    request: WebsocketAPIGatewayEvent,
  ): WebsocketAPIGatewayEvent {
    return request;
  }

  protected async execute(
    request: WebsocketAPIGatewayEvent,
  ): Promise<CustomResponse<void>> {
    console.log({ requestContext: request.requestContext });
    console.log({ body: request?.body });
    return Response.ok(await this.websocketService.onConnect(request)).build();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}
