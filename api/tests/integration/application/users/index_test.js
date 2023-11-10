import { expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { userController } from '../../../../lib/application/users/user-controller.js';
import * as moduleUnderTest from '../../../../lib/application/users/index.js';

describe('Integration | Application | Users | Routes', function () {
  const methodGET = 'GET';
  const methodPATCH = 'PATCH';

  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf');
    sinon
      .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
      .callsFake((request, h) => h.response(true));

    sinon.stub(userController, 'getUserDetailsForAdmin').returns('ok');
    sinon.stub(userController, 'updateUserDetailsForAdministration').returns('updated');
    sinon.stub(userController, 'resetScorecard').returns('ok');
    sinon.stub(userController, 'rememberUserHasSeenChallengeTooltip').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/users', function () {
    context('when user create account before joining campaign', function () {
      it('should return HTTP 201', async function () {
        // given / when
        const response = await httpTestServer.request('POST', '/api/users', {
          data: {
            attributes: {
              'first-name': 'marine',
              'last-name': 'test',
              email: 'test1@example.net',
              username: null,
              password: 'Password123',
              cgu: true,
              'must-validate-terms-of-service': false,
              'has-seen-assessment-instructions': false,
              'has-seen-new-dashboard-info': false,
              lang: 'fr',
              'is-anonymous': false,
            },
            type: 'users',
          },
          meta: {
            'campaign-code': 'TRWYWV411',
          },
        });

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return HTTP 400', async function () {
        // given
        const payload = {};

        const url = '/api/users';

        // when
        const response = await httpTestServer.request('POST', url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/users/{userId}/competences/{competenceId}/reset', function () {
    it('should return OK (200) when params are valid', async function () {
      // given
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = '/api/users/123/competences/abcdefghijklmnop/reset';

      // when
      const response = await httpTestServer.request('POST', url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return BAD_REQUEST (400) when competenceId parameter is invalid', async function () {
      // given
      const invalidCompetenceId = 'A'.repeat(256);
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = `/api/users/123/competences/${invalidCompetenceId}/reset`;

      // when
      const response = await httpTestServer.request('POST', url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/users/{id}/has-seen-challenge-tooltip/{challengeType}', function () {
    it('should return 400 - Bad request when challengeType is not valid', async function () {
      // given
      const url = '/api/users/1/has-seen-challenge-tooltip/invalid';

      // when
      const response = await httpTestServer.request(methodPATCH, url, {});

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 200 when challengeType is valid', async function () {
      // given
      const url = '/api/users/1/has-seen-challenge-tooltip/other';

      // when
      const response = await httpTestServer.request(methodPATCH, url, {});

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  context('Routes /admin', function () {
    describe('GET /api/admin/users/{id}', function () {
      it('should exist', async function () {
        // given
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);
        const url = '/api/admin/users/123';

        // when
        const response = await httpTestServer.request(methodGET, url);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return BAD_REQUEST (400) when id in param is not a number"', async function () {
        // given
        const url = '/api/admin/users/NOT_A_NUMBER';

        // when
        const response = await httpTestServer.request(methodGET, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return BAD_REQUEST (400) when id in param is out of range"', async function () {
        // given
        const url = '/api/admin/users/0';

        // when
        const response = await httpTestServer.request(methodGET, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('PATCH /api/admin/users/{id}', function () {
      it('should update user when payload is valid', async function () {
        // given
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);
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

      it('should return bad request when firstName is missing', async function () {
        // given
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns(() => true);
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

      it('should return bad request when lastName is missing', async function () {
        // given
        securityPreHandlers.adminMemberHasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());
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

      it('should return a 400 when id in param is not a number"', async function () {
        // given
        const url = '/api/admin/users/NOT_A_NUMBER';

        // when
        const response = await httpTestServer.request(methodGET, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
