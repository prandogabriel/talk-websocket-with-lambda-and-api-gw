// eslint-disable-next-line import/no-import-module-exports
import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "websocket-example",
  frameworkVersion: "3",
  plugins: ["serverless-offline", "serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "us-east-1",
    apiName: "websocket-example-api",
    websocketsApiName: "websocket-example-socket",
    websocketsApiRouteSelectionExpression: "$request.body.action", // define the route selection expression for the API
    memorySize: 256,
    timeout: 10,
    logRetentionInDays: 30,
    apiGateway: {
      websocketApiId: null,
      apiKeySourceType: "HEADER",
      description: "websocket example",
      disableDefaultEndpoint: true,
      binaryMediaTypes: ["*/*"],
      metrics: false,
    },
  },
  functions: {
    "websocket-connect": {
      handler: "src/handler.connectFunction",
      events: [
        {
          websocket: {
            route: "$connect",
          },
        },
      ],
      timeout: 10,
    },

    "websocket-default": {
      handler: "src/handler.defaultFunction",
      events: [
        {
          websocket: {
            route: "$default",
          },
        },
      ],
      timeout: 10,
    },
    "websocket-disconnect": {
      handler: "src/handler.disconnectFunction",
      events: [
        {
          websocket: {
            route: "$disconnect",
          },
        },
      ],
      timeout: 10,
    },
    "websocket-on-message": {
      handler: "src/handler.onMessageFunction",
      events: [
        {
          websocket: {
            route: "$sendmessage",
          },
        },
      ],
      timeout: 10,
    },
    "websocket-join-room": {
      handler: "src/handler.joinRoom",
      events: [
        {
          websocket: {
            route: "$joinroom",
          },
        },
      ],
      timeout: 10,
    },
  },
  package: { individually: true, excludeDevDependencies: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["@aws-sdk/*"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
