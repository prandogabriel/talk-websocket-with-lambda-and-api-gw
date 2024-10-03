/* eslint-disable import/no-import-module-exports */
import type { AWS } from "@serverless/typescript";
import * as functions from "@functions/index";

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: "websocket-example",
  frameworkVersion: "3",
  plugins: ["serverless-offline", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "us-east-1",
    apiName: "websocket-example-api",
    websocketsApiName: "websocket-example-socket",
    websocketsApiRouteSelectionExpression: "$request.body.action", // define the route selection expression for the API
    memorySize: 256,
    versionFunctions: false,
    timeout: 10,
    logRetentionInDays: 30,
    apiGateway: {
      websocketApiId: null,
      apiKeySourceType: "HEADER",
      description: "websocket example",
      disableDefaultEndpoint: true,
      binaryMediaTypes: ["*/*"],
      metrics: false
    },
    environment: {
      CONNECTIONS_TABLE: "Connections",
      POST_WEBSOCKET_URL:
        "https://4a7ipl75i0.execute-api.us-east-1.amazonaws.com/dev/"
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:PutItem",
              "dynamodb:GetItem",
              "dynamodb:DeleteItem",
              "dynamodb:Scan",
              "dynamodb:Query"
            ],
            Resource: [
              "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:provider.environment.CONNECTIONS_TABLE}",
              "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:provider.environment.CONNECTIONS_TABLE}/index/RoomKeyIndex"
            ]
          }
        ]
      }
    }
  },
  functions,
  resources: {
    Resources: {
      ConnectionsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.CONNECTIONS_TABLE}",
          AttributeDefinitions: [
            { AttributeName: "connectionId", AttributeType: "S" },
            { AttributeName: "roomKey", AttributeType: "S" }
          ],
          KeySchema: [{ AttributeName: "connectionId", KeyType: "HASH" }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          TimeToLiveSpecification: {
            AttributeName: "ttl",
            Enabled: true
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: "RoomKeyIndex",
              KeySchema: [{ AttributeName: "roomKey", KeyType: "HASH" }],
              Projection: {
                ProjectionType: "ALL"
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
              }
            }
          ]
        }
      }
    }
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
      concurrency: 10
    }
  }
};

module.exports = serverlessConfiguration;
