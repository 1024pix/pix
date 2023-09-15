import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { type Server, type ServerInjectOptions } from '@hapi/hapi';

import { HapiServer } from '../../../src/lib/server.js';

describe('Acceptance | Controllers | HealthcheckController', () => {
  let server: Server;

  beforeEach(async function (): Promise<void> {
    const hapiServer = await HapiServer.createServer();
    server = hapiServer.server;
  });

  afterEach(async function (): Promise<void> {
    await server.stop();
  });

  test('returns a 200 HTTP status code', async () => {
    // given
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/health',
    };

    // when
    const response = await server.inject(options);

    // then
    expect(response.statusCode).toEqual(200);
  });
});
