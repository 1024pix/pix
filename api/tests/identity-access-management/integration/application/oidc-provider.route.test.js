import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider/oidc-provider.controller.js';
import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../src/identity-access-management/domain/errors.js';
import { UserNotFoundError } from '../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | oidc-provider', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    httpTestServer.setupDeserialization();
    await httpTestServer.register(routesUnderTest);
  });

  describe('POST /api/oidc/user/check-reconciliation', function () {
    context('error cases', function () {
      context('when user is not found', function () {
        it('returns a response with HTTP status code 404', async function () {
          // given
          sinon.stub(oidcProviderController, 'findUserForReconciliation').rejects(new UserNotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'POLE_EMPLOI',
                'authentication-key': '123abc',
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('Ce compte est introuvable.');
        });
      });

      context('when authentication key expired', function () {
        it('returns a response with HTTP status code 401', async function () {
          // given
          sinon.stub(oidcProviderController, 'findUserForReconciliation').rejects(new AuthenticationKeyExpired());

          // when
          const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'POLE_EMPLOI',
                'authentication-key': '123abc',
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(401);
          expect(response.result.errors[0].detail).to.equal('This authentication key has expired.');
        });
      });

      context('when external identity id and external identifier are different', function () {
        it('returns a response with HTTP status code 412', async function () {
          // given
          sinon
            .stub(oidcProviderController, 'findUserForReconciliation')
            .rejects(new DifferentExternalIdentifierError());

          // when
          const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'POLE_EMPLOI',
                'authentication-key': '123abc',
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal(
            "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire.",
          );
        });
      });
    });
  });
});
