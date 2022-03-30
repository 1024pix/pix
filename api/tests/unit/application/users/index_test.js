const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const featureToggles = require('../../../../lib/application/preHandlers/feature-toggles');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');
const userController = require('../../../../lib/application/users/user-controller');
const moduleUnderTest = require('../../../../lib/application/users');

describe('Unit | Router | user-router', function () {
  describe('GET /api/users', function () {
    const method = 'GET';

    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'findPaginatedFilteredUsers').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/users', function () {
    const method = 'POST';
    const url = '/api/users';

    context('Payload schema validation', function () {
      it('should return HTTP 400 if payload does not exist', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = null;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return HTTP 200 if payload is not empty and valid', async function () {
        // given
        sinon.stub(userController, 'save').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function () {
    const method = 'GET';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'getCurrentUser').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/me';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/users/{id}/memberships', function () {
    const method = 'GET';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'getMemberships').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/memberships';

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.getMemberships);
    });
  });

  describe('PATCH /api/users/{id}/password-update', function () {
    const method = 'PATCH';
    const url = '/api/users/12344/password-update';

    it('should exist and pass through user verification pre-handler', async function () {
      // given
      sinon.stub(userController, 'updatePassword').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payloadAttributes = { password: 'Pix2019!' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(userVerification.verifyById);
    });

    describe('Payload schema validation', function () {
      it('should have a payload', async function () {
        // when
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should have a password attribute in payload', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('password validation', function () {
        it('should have a valid password format in payload', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payloadAttributes = {
            password: 'Mot de passe mal formé',
          };
          const payload = { data: { attributes: payloadAttributes } };

          // when
          const result = await httpTestServer.request(method, url, payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/users/{id}/is-certifiable', function () {
    const method = 'GET';
    const url = '/api/users/42/is-certifiable';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'isCertifiable').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.isCertifiable);
    });
  });

  describe('GET /api/users/{id}/profile', function () {
    const method = 'GET';
    const url = '/api/users/42/profile';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'getProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.getProfile);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/profile', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserProfileSharedForCampaign').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/profile';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/assessment-result', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserCampaignAssessmentResult').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/assessment-result';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/assessment-result`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/assessment-result`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserCampaignParticipationToCampaign').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/campaign-participations';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/users/{id}', function () {
    const method = 'PATCH';

    it('should verify user identity and return sucess update', async function () {
      // given
      sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = '12344';
      const url = `/api/admin/users/${userId}`;
      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkUserHasRolePixMaster);
    });

    describe('Payload and path param schema validation', function () {
      const method = 'PATCH';
      const url = '/api/admin/users/not_number';

      it('should return bad request when param id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: { email: 'partial@update.net' } } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not found', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    const method = 'POST';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(204));
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/admin/users/1/anonymize';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(204);
    });

    it('should return 400 when id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/admin/users/wrongId/anonymize';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
      expect(JSON.parse(result.payload).errors[0].detail).to.equal('"id" must be a number');
    });
  });

  describe('POST /api/admin/users/{id}/remove-authentication', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['GAR', 'EMAIL', 'USERNAME', 'POLE_EMPLOI'].forEach((type) => {
      it(`should return 200 when type is ${type}`, async function () {
        // given
        sinon.stub(userController, 'removeAuthenticationMethod').returns('ok');
        sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const url = '/api/admin/users/1/remove-authentication';
        const payload = {
          data: {
            attributes: {
              type,
            },
          },
        };

        // when
        const result = await httpTestServer.request('POST', url, payload);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });

    it('should return 400 when id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/admin/users/wrongId/remove-authentication';
      const payload = {
        data: {
          attributes: {
            type: 'EMAIL',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when type is not GAR or EMAIL or USERNAME or POLE_EMPLOI', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/admin/users/1/remove-authentication';
      const payload = {
        data: {
          attributes: {
            type: 'INVALID',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PUT /api/users/{id}/email/verification-code', function () {
    it('should return HTTP code 204', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'sendVerificationCode').callsFake((request, h) => h.response({}).code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';
      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(204);
    });

    it('should return 422 when id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/wrongId/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"id" must be a number');
    });

    it('should return 422 when type is not users', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'WRONG-TYPE',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.type" must be [email-verification-codes]');
    });

    it('should return 422 when email is not valid', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'newEmail',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.new-email" must be a valid email');
    });

    it('should return 422 when password is not provided', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.password" is required');
    });
  });

  describe('POST /api/users/{id}/update-email', function () {
    it('should return 403 if requested user is not the same as authenticated user', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/update-email';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '999999',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(403);
      expect(result.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
    });

    it('should return 422 when code is not valid', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/update-email';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '9',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal(
        '"data.attributes.code" with value "9" fails to match the required pattern: /^[1-9]{6}$/'
      );
    });
  });
});
