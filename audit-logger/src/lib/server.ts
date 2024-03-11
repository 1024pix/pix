import hapiBasicPlugin from '@hapi/basic';
import { type Request, Server, type ServerOptions } from '@hapi/hapi';
import hapiPinoPlugin from 'hapi-pino';

import { disconnect } from '../db/knex-database-connection.js';
import { config } from './config.js';
import { logger } from './infrastructure/logger.js';
import { areCredentialsValid } from './infrastructure/services/authentication.service.js';
import { ROUTES } from './routes.js';

const { port } = config;

export class HapiServer {
  private readonly _server: Server;

  constructor() {
    const debugOptions: ServerOptions['debug'] = { request: false, log: false };
    if (process.env.NODE_ENV !== 'production') {
      debugOptions.request = ['error'];
    }

    this._server = new Server({
      compression: false,
      debug: debugOptions,
      routes: {
        cors: {
          origin: ['*'],
          additionalHeaders: ['X-Requested-With'],
        },
        response: {
          emptyStatusCode: 204,
        },
      },
      port,
      router: {
        isCaseSensitive: false,
        stripTrailingSlash: true,
      },
    });
  }

  get server(): Server {
    return this._server;
  }

  async start(): Promise<void> {
    await this._server.start();
  }

  async stop(options?: { timeout: number } | undefined): Promise<void> {
    logger.info('Stopping HAPI server...');
    await this._server.stop(options);
    logger.info('Closing connections to database...');
    await disconnect();
    logger.info('Exiting process...');
  }

  static async createServer(): Promise<HapiServer> {
    const hapiServer = new HapiServer();

    await hapiServer.server.register(hapiBasicPlugin);
    hapiServer.server.auth.strategy('simple', 'basic', {
      validate: async (_: Request, username: string, password: string) => {
        if (await areCredentialsValid(username, password)) {
          return { isValid: true, credentials: {} };
        }
        return { isValid: false, credentials: null };
      },
    });
    await hapiServer.server.register({
      plugin: hapiPinoPlugin,
      options: {
        instance: logger,
        logRequestStart: true,
        redact: ['req.headers.authorization'],
      },
    });
    hapiServer.server.route(ROUTES);

    return hapiServer;
  }
}
