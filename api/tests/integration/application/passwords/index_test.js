const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const passwordController = require('../../../../lib/application/passwords/password-controller');
const moduleUnderTest = require('../../../../lib/application/passwords');

describe('Integration | Application | Password | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(passwordController, 'updateExpiredPassword').callsFake((request, h) => h.response().created());
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/expired-password-updates', () => {

    it('should return 201 http status code', async () => {
      // given
      const method = 'POST';
      const url = '/api/expired-password-updates';
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            username: 'firstName.lastName0512',
            expiredPassword: 'expiredPassword01',
            newPassword: 'newPassword02'
          },
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

});
