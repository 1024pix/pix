import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { userOrgaSettingsController } from '../../../../lib/application/user-orga-settings/user-orga-settings-controller.js';
import * as moduleUnderTest from '../../../../lib/application/user-orga-settings/index.js';

describe('Unit | Router | user-orga-settings-router', function () {
  describe('PUT /api/user-orga-settings/{id}', function () {
    const userId = 2;
    const auth = { credentials: { userId: userId }, strategy: {} };

    it('should exist', async function () {
      // given
      sinon.stub(userOrgaSettingsController, 'createOrUpdate').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PUT';
      const url = `/api/user-orga-settings/${userId}`;
      const payload = {
        data: {
          relationships: {
            organization: {
              data: {
                id: 1,
                type: 'organizations',
              },
            },
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when requested user is not the authenticated user', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PUT';
        const url = `/api/user-orga-settings/99`;
        const payload = {
          data: {
            relationships: {
              organization: {
                data: {
                  id: 1,
                  type: 'organizations',
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload, auth);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Payload schema validation', function () {
      it('should be mandatory', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PUT';
        const url = `/api/user-orga-settings/${userId}`;
        const payload = undefined;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should contain relationships.organization.data.id', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PUT';
        const url = `/api/user-orga-settings/${userId}`;
        const payload = {
          data: {
            relationships: {
              organization: {
                data: {
                  id: undefined,
                  type: 'organizations',
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should contain relationships.organization.data.id as number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'PUT';
        const url = `/api/user-orga-settings/${userId}`;
        const payload = {
          data: {
            relationships: {
              organization: {
                data: {
                  id: 'test',
                  type: 'organizations',
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
