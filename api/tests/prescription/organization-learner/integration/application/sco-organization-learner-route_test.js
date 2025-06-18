import { scoOrganizationLearnerController } from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Route | sco-organization-learners', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents')
      .callsFake((request, h) => h.response(true));
    sinon
      .stub(scoOrganizationLearnerController, 'updatePassword')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(scoOrganizationLearnerController, 'createUserAndReconcileToOrganizationLearnerFromExternalUser')
      .callsFake((request, h) => h.response('ok').code(200));
    sinon
      .stub(scoOrganizationLearnerController, 'generateUsernameWithTemporaryPassword')
      .callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let method;
    let url;
    let payload;
    let response;

    beforeEach(async function () {
      // given
      method = 'POST';
      url = '/api/sco-organization-learners/external';
      payload = {
        data: {
          attributes: {
            'organization-id': 1,
            'external-user-token': 'external-user-token',
            birthdate: '1948-12-21',
            'access-token': null,
          },
          type: 'external-users',
        },
      };
    });

    it('should return a 400 Bad Request when organizationId is missing', async function () {
      // given
      payload.data.attributes['organization-id'] = undefined;

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal('"data.attributes.organization-id" is required');
    });

    it('should return 400 Bad Request when external-user-token is missing', async function () {
      // given
      payload.data.attributes['external-user-token'] = '';

      // when
      response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal(
        '"data.attributes.external-user-token" is not allowed to be empty',
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
        '"data.attributes.birthdate" must be in YYYY-MM-DD format',
      );
    });
  });

  describe('POST /api/sco-organization-learners/dependent', function () {
    let method;
    let url;
    let payload;
    let response;

    context('Error cases', function () {
      beforeEach(async function () {
        // given
        method = 'POST';
        url = '/api/sco-organization-learners/dependent';
        payload = {
          data: {
            attributes: {
              'organization-id': 1,
              'first-name': 'Robert',
              'last-name': 'Smith',
              birthdate: '2012-12-12',
              username: 'robert.smith1212',
              password: 'P@ssw0rd',
              'with-username': true,
            },
          },
        };
      });

      it('should return 400 when firstName is empty', async function () {
        // given
        payload.data.attributes['first-name'] = '';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when lastName is empty', async function () {
        // given
        payload.data.attributes['last-name'] = '';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when birthDate is not a valid date', async function () {
        // given
        payload.data.attributes.birthdate = '2012*-12-12';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when organizationId is null', async function () {
        // given
        payload.data.attributes['organization-id'] = null;

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when password is not valid', async function () {
        // given
        payload.data.attributes.password = 'not_valid';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when withUsername is not a boolean', async function () {
        // given
        payload.data.attributes['with-username'] = 'not_a_boolean';

        // when
        response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when username is not valid', function () {
        it('should return 400 when username is an email', async function () {
          // given
          payload.data.attributes.username = 'robert.smith1212@example.net';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username has not dot between names', async function () {
          // given
          payload.data.attributes.username = 'robertsmith1212';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username does not end with 4 digits', async function () {
          // given
          payload.data.attributes.username = 'robert.smith';

          // when
          response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username is capitalized', async function () {
          // given
          payload.data.attributes.username = 'Robert.Smith1212';

          // when
          response = await httpTestServer.request(method, url, payload);
          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 when username is a phone number', async function () {
          // given
          payload.data.attributes.username = '0601010101';

          // when
          response = await httpTestServer.request(method, url, payload);
          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/password-update', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/sco-organization-learners/password-update';
      const payload = {
        data: {
          attributes: {
            'organization-learner-id': 1,
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

  describe('POST /api/sco-organization-learners/username-password-generation', function () {
    it('should succeed', async function () {
      // given
      const method = 'POST';
      const url = '/api/sco-organization-learners/username-password-generation';
      const payload = {
        data: {
          attributes: {
            'organization-learner-id': 1,
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
