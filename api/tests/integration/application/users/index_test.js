const { expect, sinon, HttpTestServer } = require('$tests/test-helper');

const securityPreHandlers = require('$lib/application/security-pre-handlers');
const userController = require('$lib/application/users/user-controller');
const moduleUnderTest = require('$lib/application/users');

describe('Integration | Application | Users | Routes', () => {

  let httpTestServer;
  const method = 'GET';

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(userController, 'getUserDetailForAdmin').returns('ok');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/admin/users/{id}', () => {

    it('should exist', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when id in param is not a number"', async () => {

      // given
      const url = '/api/admin/users/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });
});
