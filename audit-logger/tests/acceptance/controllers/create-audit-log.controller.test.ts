import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { HapiServer } from '../../../src/lib/server';
import { type Server, type ServerInjectOptions } from '@hapi/hapi';

describe('Acceptance | Controllers | CreateAuditLogController', () => {
  let server: Server;
  let options: ServerInjectOptions;

  beforeEach(async function (): Promise<void> {
    const hapiServer = await HapiServer.createServer();
    server = hapiServer.server;

    options = {
      method: 'POST',
      url: '/api/audit-logs',
      payload: {
        targetUserId: '2',
        userId: '3',
        action: 'ANONYMIZATION',
        occurredAt: new Date('2023-07-05'),
        role: 'SUPPORT',
        client: 'PIX_ADMIN',
      },
    };
  });

  afterEach(async function (): Promise<void> {
    await server.stop();
  });

  describe('when request is valid', () => {
    test('returns a no content http status', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).toEqual(204);
    });
  });

  describe('when request is not valid', () => {
    test('returns a bad request http status', async () => {
      // given
      options.payload = {
        targetUserId: '2',
        userId: 3,
        action: 'READ',
        occurredAt: new Date('2023-07-05'),
        role: 'METIER',
        client: 'PIX_APP',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).toEqual(400);
    });
  });
});
