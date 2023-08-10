import { Server } from '@hapi/hapi';
import hapiBasicPlugin from '@hapi/basic';

import { config } from './config.js';
import { ROUTES } from './routes.js';
import { disconnect } from '../db/knex-database-connection.js';
import { logger } from './infrastructure/logger.js';

const { port } = config;

export class HapiServer {
  private readonly _server: Server;

  constructor() {
    this._server = new Server({
      compression: false,
      debug: { request: false, log: false },
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
    hapiServer.server.route(ROUTES);

    return hapiServer;
  }
}
