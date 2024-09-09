import type { Handler } from "aws-lambda";
import { WebsocketService } from "@services/websocket";
import { logger } from "@libs/logger";

const websocketService = new WebsocketService(logger);

export const main: Handler = async (event) => {
  logger.appendPersistentKeys({ requestId: event.requestContext.requestId });

  logger.info("requestContext", { requestContext: event.requestContext });
  await websocketService.onConnect(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `success`
    })
  };
};
