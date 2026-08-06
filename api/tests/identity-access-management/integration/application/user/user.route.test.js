import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { config } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | User', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
    httpTestServer.setupAuthentication();
  });

  describe('POST /api/users', function () {
    context('invalid payload', function () {
      context('when a required property is missing', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          const payload = {
            data: {
              type: 'users',
              attributes: {
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: true,
              },
            },
          };

          const url = '/api/users';

          // when
          const response = await httpTestServer.request('POST', url, payload);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.first-name" is required');
        });
      });

      context('when the locale is not supported', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          const locale1 = 'fr-fr';
          const locale2 = 'tlh'; // tlh: Klingon locale
          const payload = {
            data: {
              type: 'users',
              attributes: {
                'first-name': 'Joséphine',
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: true,
              },
            },
          };

          const url = '/api/users';

          // when
          payload.locale = locale1;
          const response1 = await httpTestServer.request('POST', url, payload);

          payload.locale = locale2;
          const response2 = await httpTestServer.request('POST', url, payload);

          // then
          expect(response1.statusCode).to.equal(400);
          expect(response1.result.errors[0].detail).to.equal('"locale" is not allowed');
          expect(response2.statusCode).to.equal(400);
          expect(response2.result.errors[0].detail).to.equal('"locale" is not allowed');
        });
      });

      context('when a property has not the valid format', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          const payload = {
            data: {
              type: 'users',
              attributes: {
                'first-name': 'Joséphine',
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: 'not_a_boolean',
              },
            },
          };

          const url = '/api/users';

          // when
          const response = await httpTestServer.request('POST', url, payload);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.cgu" must be a boolean');
        });
      });
    });

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
    });
  });

  describe('PATCH /api/users', function () {
    context('invalid payload', function () {
      context('when a required property is missing', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.anonymous().id;
          await databaseBuilder.commit();

          const headers = generateAuthenticatedUserRequestHeaders({ userId });

          const payload = {
            data: {
              id: userId,
              type: 'users',
              attributes: {
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: true,
              },
            },
          };

          const url = `/api/users/${userId}`;

          // when
          const response = await httpTestServer.request('PATCH', url, payload, null, headers);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.first-name" is required');
        });
      });

      context('when a property has not the valid format', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.anonymous().id;
          await databaseBuilder.commit();

          const headers = generateAuthenticatedUserRequestHeaders({ userId });

          const payload = {
            data: {
              id: userId,
              type: 'users',
              attributes: {
                'first-name': 'Joséphine',
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: 'not_a_boolean',
              },
            },
          };

          const url = `/api/users/${userId}`;

          // when
          const response = await httpTestServer.request('PATCH', url, payload, null, headers);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.cgu" must be a boolean');
        });
      });
    });
  });

  describe('PATCH /api/users/{id}/password-update', function () {
    context('when the password reset demand is expired', function () {
      it('throws an InvalidTemporaryKeyError', async function () {
        // given
        // given
        const user = databaseBuilder.factory.buildUser();
        const userId = user.id;
        const email = user.email;

        sinon.stub(config.passwordResetDemand, 'lifespan').value(0);
        const temporaryKey = await resetPasswordService.generateTemporaryKey();
        databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

        await databaseBuilder.commit();

        const newPassword = 'example-of-a-new-password';

        const payload = {
          data: {
            id: userId,
            attributes: {
              password: newPassword,
            },
          },
        };
        const url = `/api/users/${userId}/password-update?temporary-key=${temporaryKey}`;

        // when
        const response = await httpTestServer.request('PATCH', url, payload, null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when user has a revokedHashedPassword', function () {
      context('when the given password is the same as the previous password', function () {
        it('throws a RevokedPasswordCannotBeReusedError', async function () {
          // given
          const initialPassword = 'example-of-a-valid-password-az-AZ-01234';
          const temporaryKey = await resetPasswordService.generateTemporaryKey();
          const user = databaseBuilder.factory.buildUser.withRawPassword({ rawPassword: initialPassword });
          const userId = user.id;
          const email = user.email;

          await databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey });

          await databaseBuilder.commit();

          await usecases.revokeAccessForUsers({ userIds: [userId] });

          const newPassword = initialPassword;
          const payload = {
            data: {
              id: userId,
              attributes: {
                password: newPassword,
              },
            },
          };
          const url = `/api/users/${userId}/password-update?temporary-key=${temporaryKey}`;

          // when
          const response = await httpTestServer.request('PATCH', url, payload, null);

          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0].code).to.equal('REVOKED_PASSWORD_CANNOT_BE_REUSED');
        });
      });
    });
  });

  describe('GET /api/user/validate-email', function () {
    context('when redirect_url is invalid', function () {
      it('should return HTTP 400 if not a URI', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?redirect_url=XXX');

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return HTTP 400 if not a https URI', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?redirect_url=http://test.com');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when token is invalid', function () {
      it('should return HTTP 400', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?token=XXX');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/users/{id}/add-email-connection-method', function () {
    it('returns 403 if requested user is not the same as authenticated user', async function () {
      // given
      const currentUserId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      const headers = generateAuthenticatedUserRequestHeaders({ userId: currentUserId });

      const url = `/api/users/${otherUserId}/add-email-connection-method`;

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '999999',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload, null, headers);

      // then
      expect(result.statusCode).to.equal(403);
      expect(result.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
    });

    it('returns EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND when code is not found', async function () {
      // given
      const headers = generateAuthenticatedUserRequestHeaders();

      const url = '/api/users/1234/add-email-connection-method';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '999999',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload, null, headers);

      // then
      expect(result.statusCode).to.equal(403);
      expect(result.result.errors[0].code).to.equal('EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND');
    });
  });

  describe('PATCH /api/users/{id}/has-seen-challenge-tooltip/{challengeType}', function () {
    it('should return 400 - Bad request when challengeType is not valid', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const headers = generateAuthenticatedUserRequestHeaders({ userId });
      const url = `/api/users/${userId}/has-seen-challenge-tooltip/invalid`;

      // when
      const response = await httpTestServer.request('PATCH', url, {}, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 200 when challengeType is valid', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const headers = generateAuthenticatedUserRequestHeaders({ userId });
      const url = `/api/users/${userId}/has-seen-challenge-tooltip/other`;

      // when
      const response = await httpTestServer.request('PATCH', url, {}, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
