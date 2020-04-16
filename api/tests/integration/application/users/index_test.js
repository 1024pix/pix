const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const userController = require('../../../../lib/application/users/user-controller');
const moduleUnderTest = require('../../../../lib/application/users');

describe('Integration | Application | Users | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    sinon.stub(userController, 'getUserDetailForAdmin').returns('ok');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/admin/users/{id}', () => {

    it('should exist', async () => {
      // given
      securityController.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const method = 'GET';
      const url = '/api/admin/users/123';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });
});
