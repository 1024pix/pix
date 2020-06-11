const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const userController = require('../../../../lib/application/users/user-controller');
const moduleUnderTest = require('../../../../lib/application/users');

describe('Integration | Application | Users | Routes', () => {

  let httpTestServer;
  const methodGET = 'GET';
  const methodPATCH = 'PATCH';

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(userController, 'getUserDetailsForAdmin').returns('ok');
    sinon.stub(userController, 'updateUserDetailsForAdministration').returns('updated');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/admin/users/{id}', () => {

    it('should exist', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';

      // when
      const response = await httpTestServer.request(methodGET, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when id in param is not a number"', async () => {

      // given
      const url = '/api/admin/users/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request(methodGET, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });

  describe('PATCH /api/admin/users/{id}', () => {

    it('should update user when payload is valid', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';

      const payload = {
        data: {
          id: '123',
          attributes: {
            'first-name': 'firstNameUpdated',
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated@example.net'
          }
        }
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return bad request with invalid email message when email is not valid', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';

      const payload = {
        data: {
          id: '123',
          attributes: {
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated@example.net'
          }
        }
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.first-name" is required');

    });

    it('should return bad request when firstName is missing', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';
      const payload = {
        data: {
          id: '123',
          attributes: {
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated'
          }
        }
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.first-name" is required');

    });

    it('should return a 400 when id in param is not a number"', async () => {

      // given
      const url = '/api/admin/users/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request(methodGET, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });
});
