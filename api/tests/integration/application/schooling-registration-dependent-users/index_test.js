const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const schoolingRegistrationDependentUserController = require('../../../../lib/application/schooling-registration-dependent-users/schooling-registration-dependent-user-controller');
const moduleUnderTest = require('../../../../lib/application/schooling-registration-dependent-users');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Route | schooling-registration-dependent-users', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
    sinon.stub(schoolingRegistrationDependentUserController, 'createAndReconcileUserToSchoolingRegistration').callsFake((request, h) => h.response().code(204));
    sinon.stub(schoolingRegistrationDependentUserController, 'createUserAndReconcileToSchoolingRegistrationFromExternalUser').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(schoolingRegistrationDependentUserController, 'generateUsernameWithTemporaryPassword').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(schoolingRegistrationDependentUserController, 'updatePassword').callsFake((request, h) => h.response('ok').code(200));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-dependent-users', () => {

    let method;
    let url;
    let payload;
    let response;

    beforeEach(async () => {
      // given
      method = 'POST';
      url = '/api/schooling-registration-dependent-users';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'first-name': 'Robert',
            'last-name': 'Smith',
            birthdate: '2012-12-12',
            username: 'robert.smith1212',
            password: 'P@ssw0rd',
            'with-username': true,
          }
        }
      };
    });

    it('should succeed', async () => {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 400 when firstName is empty', async () => {
      // given
      payload.data.attributes['first-name'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when lastName is empty', async () => {
      // given
      payload.data.attributes['last-name'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when birthDate is not a valid date', async () => {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when campaignCode is empty', async () => {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when password is not valid', async () => {
      // given
      payload.data.attributes.password = 'not_valid';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when withUsername is not a boolean', async () => {
      // given
      payload.data.attributes['with-username'] = 'not_a_boolean';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/external-user-token', () => {

    let method;
    let url;
    let payload;
    let response;

    beforeEach(async () => {
      // given
      method = 'POST';
      url = '/api/schooling-registration-dependent-users/external-user-token';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'external-user-token': 'external-user-token',
            'birthdate': '1948-12-21',
            'access-token': null,
          },
          type: 'external-users',
        }
      };
    });

    it('should succeed', async () => {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 Bad Request when campaignCode is missing', async () => {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal('"data.attributes.campaign-code" is not allowed to be empty');
    });

    it('should return 400 Bad Request when external-user-token is missing', async () => {
      // given
      payload.data.attributes['external-user-token'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal('"data.attributes.external-user-token" is not allowed to be empty');
    });

    it('should return 400 Bad Request when birthDate is not a valid date', async () => {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal('"data.attributes.birthdate" must be in YYYY-MM-DD format');
    });
  });

  describe('POST /api/schooling-registration-dependent-users/password-update', () => {

    it('should succeed', async () => {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/password-update';
      const payload = {
        data: {
          attributes: {
            'schooling-registration-id': 1,
            'organization-id': 3
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', () => {

    it('should succeed', async () => {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/generate-username-password';
      const payload = {
        data: {
          attributes: {
            'schooling-registration-id': 1,
            'organization-id': 3
          }
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
