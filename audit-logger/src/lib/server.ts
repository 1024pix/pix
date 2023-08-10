import { type Request, Server, type ServerOptions } from '@hapi/hapi';
import hapiBasicPlugin from '@hapi/basic';

import { config } from './config.js';
import { ROUTES } from './routes.js';
import { disconnect } from '../db/knex-database-connection.js';
import { logger } from './infrastructure/logger.js';
import { validate } from './infrastructure/services/authentication.service.js';

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

  async stop(options?: {timeout: number} | undefined): Promise<void> {
    logger.info('Stopping HAPI server...');
    await this._server.stop(options);
    logger.info('Closing connections to database...');
    await disconnect();
    logger.info('Exiting process...');
  }

  static async createServer(): Promise<HapiServer>
  {
    const hapiServer = new HapiServer();
    await hapiServer.server.register(hapiBasicPlugin);
    hapiServer.server.auth.strategy('simple', 'basic', {
      validate: async (_:Request, username: string, password: string) => await validate(username, password)
    });
    hapiServer.server.route(ROUTES);

    return hapiServer;
  }
}

