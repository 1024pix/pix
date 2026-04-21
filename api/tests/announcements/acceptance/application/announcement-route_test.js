import { createServer } from '../../../../server.js';
import { announcementsStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';

import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const CONTENT = { fr: 'Contenu en français', en: 'Content in English' };

let server;

describe('Acceptance | Router | announcement-route', function () {
  beforeEach(async function () {
    server = await createServer();
    await announcementsStorage.flushAll();
  });

  describe('GET /api/announcements/SCO', function () {
    context('when no announcement exists in the database', function () {
      it('should return an announcement with null content', async function () {
        const response = await server.inject({ method: 'GET', url: '/api/announcements/SCO' });

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.content).to.be.null;
      });
    });

    context('when an announcement exists in the database', function () {
      beforeEach(async function () {
        await knex('announcements').insert({ name: 'SCO', content: JSON.stringify(CONTENT) });
      });

      it('should return the announcement content', async function () {
        const response = await server.inject({ method: 'GET', url: '/api/announcements/SCO' });

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.content).to.deep.equal(CONTENT);
      });
    });
  });

  describe('PATCH /api/admin/announcements/SCO', function () {
    context('when user is super admin', function () {
      let headers;

      beforeEach(async function () {
        const superAdminUser = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();
        headers = generateAuthenticatedUserRequestHeaders({ userId: superAdminUser.id });
      });

      it('should return 400 when content contains an unsupported locale key', async function () {
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/announcements/SCO',
          headers,
          payload: {
            data: {
              type: 'announcements',
              attributes: { content: { invalid_locale: 'some content' } },
            },
          },
        });

        expect(response.statusCode).to.equal(400);
      });

      it('should return 200 when content contains an empty string', async function () {
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/announcements/SCO',
          headers,
          payload: {
            data: {
              type: 'announcements',
              attributes: { content: { fr: '' } },
            },
          },
        });

        expect(response.statusCode).to.equal(200);
      });

      it('should update the announcement content and return 200', async function () {
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/announcements/SCO',
          headers,
          payload: {
            data: {
              type: 'announcements',
              attributes: { content: CONTENT },
            },
          },
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.content).to.deep.equal(CONTENT);
        const row = await knex('announcements').where({ name: 'SCO' }).first();
        expect(row.content).to.deep.equal(CONTENT);
      });
    });

    context('when user is not super admin', function () {
      it('should return 403 Forbidden', async function () {
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/announcements/SCO',
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              type: 'announcements',
              attributes: { content: CONTENT },
            },
          },
        });

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not authenticated', function () {
      it('should return 401 Unauthorized', async function () {
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/admin/announcements/SCO',
          payload: {
            data: {
              type: 'announcements',
              attributes: { content: CONTENT },
            },
          },
        });

        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
