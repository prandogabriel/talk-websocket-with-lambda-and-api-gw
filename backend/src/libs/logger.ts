import { Logger } from "@aws-lambda-powertools/logger";

export const logger = new Logger({
  serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME
});

export default logger;
