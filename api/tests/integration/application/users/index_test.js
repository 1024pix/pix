const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const userController = require('../../../../lib/application/users/user-controller');
const moduleUnderTest = require('../../../../lib/application/users');

describe('Integration | Application | Users | Routes', () => {

  const methodGET = 'GET';
  const methodPATCH = 'PATCH';

  let payload;

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));

    sinon.stub(userController, 'getUserDetailsForAdmin').returns('ok');
    sinon.stub(userController, 'updateUserDetailsForAdministration').returns('updated');
    sinon.stub(userController, 'dissociateSchoolingRegistrations').returns('ok');

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
            email: 'emailUpdated@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
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
            email: 'emailUpdated@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.first-name" is required');
    });

    it('should return bad request when lastName is missing', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));
      const url = '/api/admin/users/123';
      const payload = {
        data: {
          id: '123',
          attributes: {
            'first-name': 'firstNameUpdated',
            email: 'emailUpdated',
          },
        },
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.last-name" is required');
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

  describe('PATCH /api/admin/users/{id}/dissociate', () => {

    const url = '/api/admin/users/1/dissociate';

    it('should dissociate user', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/users/{id}/email', () => {

    const url = '/api/users/1/email';

    it('should return 422 if email is invalid', async () => {
      // given
      const payload = {
        data: {
          type: 'users',
          attributes: {
            email: 'not_an_email',
          },
        },
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return 422 if type attribute is missing', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            email: 'user@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request(methodPATCH, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

  });
});
