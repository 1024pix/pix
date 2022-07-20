const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const organizationLearnerDependentUserController = require('../../../../lib/application/organization-learner-dependent-users/organization-learner-dependent-user-controller');
const moduleUnderTest = require('../../../../lib/application/organization-learner-dependent-users');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Route | organization-learner-dependent-users', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents')
      .callsFake((request, h) => h.response(true));
    sinon
      .stub(organizationLearnerDependentUserController, 'createUserAndReconcileToOrganizationLearnerFromExternalUser')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(organizationLearnerDependentUserController, 'generateUsernameWithTemporaryPassword')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(organizationLearnerDependentUserController, 'updatePassword')
      .callsFake((request, h) => h.response('ok').code(200));
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/schooling-registration-dependent-users/external-user-token', function () {
    let method;
    let url;
    let payload;
    let response;

    beforeEach(async function () {
      // given
      method = 'POST';
      url = '/api/schooling-registration-dependent-users/external-user-token';
      payload = {
        data: {
          attributes: {
            'campaign-code': 'RESTRICTD',
            'external-user-token': 'external-user-token',
            birthdate: '1948-12-21',
            'access-token': null,
          },
          type: 'external-users',
        },
      };
    });

    it('should succeed', async function () {
      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 Bad Request when campaignCode is missing', async function () {
      // given
      payload.data.attributes['campaign-code'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.campaign-code" is not allowed to be empty'
      );
    });

    it('should return 400 Bad Request when external-user-token is missing', async function () {
      // given
      payload.data.attributes['external-user-token'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.external-user-token" is not allowed to be empty'
      );
    });

    it('should return 400 Bad Request when birthDate is not a valid date', async function () {
      // given
      payload.data.attributes.birthdate = '2012*-12-12';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.birthdate" must be in YYYY-MM-DD format'
      );
    });
  });

  describe('POST /api/schooling-registration-dependent-users/password-update', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/password-update';
      const payload = {
        data: {
          attributes: {
            'schooling-registration-id': 1,
            'organization-id': 3,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/schooling-registration-dependent-users/generate-username-password';
      const payload = {
        data: {
          attributes: {
            'schooling-registration-id': 1,
            'organization-id': 3,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
