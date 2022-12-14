import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import FileUploadDataSource from '@profusion/apollo-federation-upload';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import Cors from 'cors';
import Express from 'express';
import { expressjwt } from 'express-jwt';
import { graphqlUploadExpress } from 'graphql-upload';
import Morgan from 'morgan';
import path from 'path';

import { port, SERVER_NAME_APP, SERVER_PORT_APP } from './config/index';

import 'reflect-metadata';

const expressHealthApi = require('express-health-api');

async function app() {
  try {
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'servers', url: 'http://localhost:4001/graphql' },
        ],
      }),
      buildService({ url }: any) {
        return new FileUploadDataSource({
          url,
          willSendRequest({ request, context }: any) {
            request.http.headers.set('user', context.user ? JSON.stringify(context.user) : null);
          },
        });
      },
    });

    //const { schema, executor } = await gateway.load();

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
        }
      ],
    };

    const server = new ApolloServer({
      gateway,
      // playground: true,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
      introspection: true,
      context: (context: any) => {
        const user = context.req.user || null;
        return { user };
      },
    });

    const app = Express();

    // Middlewares
    app.use(require('express-status-monitor')(configExpressStatusMonitor));
    app.use(Morgan('common'));
    // app.use(Helmet({
    //   contentSecurityPolicy: false,
    // }));
    app.use(Cors());
    app.use(expressHealthApi({ apiPath: '/health' }));


    app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }))
    app.use('/public', Express.static(path.join(__dirname, '../public')));
    app.use(Express.json());
    app.use(
      expressjwt({
        secret: 'f1BtnWgD3VKY',
        algorithms: ['HS256'],
        credentialsRequired: false,
      })
    );
    server.start().then(() => {
      server.applyMiddleware({ app });
    });
    app.listen({ port: port }, () =>
      console.log(
        `???? Server ready and listening at ==> http://localhost:${port}${server.graphqlPath}`
      )
    );
  } catch (err) {
    console.error(err);
  }
}

app();
