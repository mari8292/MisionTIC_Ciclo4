import { buildSubgraphSchema } from '@apollo/federation';
import { printSubgraphSchema } from '@apollo/subgraph';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import gql from 'graphql-tag';
import { graphqlUploadExpress } from 'graphql-upload';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import Morgan from 'morgan';
import { env } from 'process';
import { buildSchemaSync, createResolversMap } from 'type-graphql';

import { SERVER_NAME_APP, SERVER_PORT_APP } from '../config';
import { UserResolver } from '../graphql/resolvers/UserResolver';
import { dataSource } from './DataSource';

import 'reflect-metadata';

const PORT = SERVER_PORT_APP;
const SERVER_NAME = SERVER_NAME_APP;

const cluster = require('node:cluster');
//const numCPUs = env.NODE_ENV === "development" ? 2 : require('node:os').cpus().length;
const numCPUs = env.NODE_ENV === "development" ? 1 : 1;
const expressHealthApi = require('express-health-api');

async function app() {
  try {
    const schema = buildSchemaSync({
      resolvers: [
        UserResolver,
      ],
      emitSchemaFile: true,
      validate: false,
    });

    const configExpressStatusMonitor = {
      title: 'Express Status', // Default title
      theme: 'default.css', // Default styles
      path: '/status',
      spans: [
        {
          interval: 1, // Every second
          retention: 60, // Keep 60 datapoints in memory
        },
        {
          interval: 5, // Every 5 seconds
          retention: 60,
        },
        {
          interval: 15, // Every 15 seconds
          retention: 60,
        },
      ],
      chartVisibility: {
        cpu: true,
        mem: true,
        load: true,
        eventLoop: true,
        heap: true,
        responseTime: true,
        rps: true,
        statusCodes: true,
      },
      healthChecks: [
        {
          protocol: 'http',
          host: 'localhost',
          path: `/healthcheck-${SERVER_NAME_APP}`,
          port: `${SERVER_PORT_APP}`,
        },
      ],
    };

    const federatedSchema = buildSubgraphSchema({
      typeDefs: gql(printSubgraphSchema(schema)),
      resolvers: createResolversMap(schema) as any,
    });

    await dataSource
      .initialize()
      .then((connection) => {
        console.log('TypeORM with mongodb: ' + SERVER_NAME);
        // console.log(connection.options);
        // console.log(connection.driver.options);
      })
      .catch((error) => {
        console.error(error);
      });

    const server = new ApolloServer({
      //schema: applyMiddleware(federatedSchema, permissions),
      schema: federatedSchema,
      context: ({ req }: any) => {
        const user = req?.headers?.user ? JSON.parse(req?.headers?.user) : null;
        const requestData = req?.headers?.requestdata
          ? JSON.parse(req?.headers?.requestdata)
          : null;
        return { user, requestData };
      },
      introspection: true,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
      formatError: (err) => {
        const errorReport = {
          message: err.message,
          locations: err.locations,
          path: err.path,
          stacktrace: err.extensions?.exception?.stacktrace || [],
          code: err.extensions?.code,
        };
        console.error('GraphQL Error', errorReport);
        if (errorReport.code == 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'Oops! Something went wrong! :(',
            code: errorReport.code,
          };
        }
        return errorReport;
      },
    });

    const app = express();
    // Middlewares
    app.use(`/healthcheck-${SERVER_NAME}`, require('express-healthcheck')());
    app.use(require('express-status-monitor')(configExpressStatusMonitor));
    app.use(Morgan('common'));
    // app.use(Helmet());
    // app.use(Cors());
    app.use(expressHealthApi({ apiPath: '/health' }));
    app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));

    // const openApi = OpenAPI({
    //   schema,
    //   info: {
    //     title: 'Example API',
    //     version: '3.0.0',
    //   },
    // });

    // app.use('/api', useSofa({ basePath:'/api', schema, onRoute(info) {
    //   openApi.addRoute(info, {
    //     basePath: '/api',
    //   });
    // }, }));

    // // writes every recorder route
    // openApi.save('./swagger.yml');

    // const swaggerDocument = require('../../../swagger.json');

    // app.use(
    //   '/api-docs',
    //   swaggerUi.serve,
    //   swaggerUi.setup(swaggerDocument)
    // );

    // app.use(swStats.getMiddleware({swaggerSpec:apiSpec}));

    app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));

    server.start().then(() => {
      server.applyMiddleware({ app });
    });

    app.listen({ port: PORT }, () => {
      console.log(
        `🚀 Server ${SERVER_NAME} Ready and Listening at ==> http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (err) {
    console.error(err);
  }
}

if (cluster.isMaster) {
  console.log(`Master Services ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // This event is firs when worker died
  cluster.on('exit', (worker: { process: { pid: any; }; }, code: any, signal: any) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}
// For Worker
else {
  app();
}

