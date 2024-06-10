import { type Server, type ServerInjectOptions } from '@hapi/hapi';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { knex } from '../../../src/db/knex-database-connection.js';
import { HapiServer } from '../../../src/lib/server.js';

describe('Acceptance | Controllers | CreateAuditLogController', () => {
  let server: Server;
  let options: ServerInjectOptions;

  beforeEach(async function (): Promise<void> {
    const hapiServer = await HapiServer.createServer();
    server = hapiServer.server;

    const base64EncodedCredentials = btoa('pix-api:pixApiClientSecretTest');

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
      headers: {
        Authorization: `Basic ${base64EncodedCredentials}`,
      },
    };
  });

  afterEach(async function (): Promise<void> {
    await knex('audit-log').truncate();
    await server.stop();
  });

  describe('when user credentials are invalid', () => {
    test('returns a unauthorized http status', async () => {
      // when
      options = {
        ...options,
        headers: {},
      };
      const response = await server.inject(options);

      // then
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when request is valid', () => {
    describe('with a single event log', () => {
      test('returns a no content http status', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).toEqual(204);
      });
    });

    describe('with multiple event logs', () => {
      test('returns a no content http status', async () => {
        // when
        const response = await server.inject(options);

        options.payload = [
          {
            targetUserId: '2',
            userId: 3,
            action: 'READ',
            occurredAt: new Date('2023-07-05'),
            role: 'METIER',
            client: 'PIX_APP',
          },
          {
            targetUserId: '2',
            userId: 3,
            action: 'READ',
            occurredAt: new Date('2023-07-06'),
            role: 'METIER',
            client: 'PIX_APP',
          },
        ];

        // then
        expect(response.statusCode).toEqual(204);
      });
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
