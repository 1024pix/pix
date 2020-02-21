const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const userOrgaSettingsController = require('../../../../lib/application/user-orga-settings/user-orga-settings-controller');

const moduleUnderTest = require('../../../../lib/application/user-orga-settings');

describe('Unit | Router | user-orga-settings-router', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(userOrgaSettingsController, 'create').returns('ok');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/user-orga-settings', () => {

    let method;
    let url;
    let payload;

    beforeEach(() => {
      method = 'POST';
      url = '/api/user-orga-settings';
      payload = {
        data: {
          relationships: {
            organization: {
              data: {
                id: 1,
                type: 'organizations'
              }
            },
            user: {
              data: {
                id: 1,
                type: 'users'
              }
            }
          }
        }
      };
    });

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('Payload schema validation', () => {

      it('should have a payload', async () => {
        // given
        payload = undefined;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should have an organization id in relationship in payload', async () => {
        // given
        payload.data.relationships.organization.data.id = undefined;

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should have a user id in relationship in payload', async () => {
        // given
        payload.data.relationships.user.data.id = undefined;

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

  });

});
