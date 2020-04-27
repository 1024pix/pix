const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const userOrgaSettingsController = require('../../../../lib/application/user-orga-settings/user-orga-settings-controller');

const moduleUnderTest = require('../../../../lib/application/user-orga-settings');

describe('Unit | Router | user-orga-settings-router', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(userOrgaSettingsController, 'createOrUpdate').returns('ok');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('PUT /api/user-orga-settings/{id}', () => {
    const userId = 2;
    const auth = { credentials: { userId: userId }, strategy: {} };
    let method;
    let url;
    let payload;

    beforeEach(() => {
      method = 'PUT';
      url = `/api/user-orga-settings/${userId}`;
      payload = {
        data: {
          relationships: {
            organization: {
              data: {
                id: 1,
                type: 'organizations'
              }
            }
          }
        }
      };
    });

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('Payload schema validation', () => {

      it('should be mandatory', async () => {
        // given
        payload = undefined;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should contain relationships.organization.data.id', async () => {
        // given
        payload.data.relationships.organization.data.id = undefined;

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should contain relationships.organization.data.id as number', async () => {
        // given
        payload.data.relationships.organization.data = { id: 'test' };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

    });

  });
});
