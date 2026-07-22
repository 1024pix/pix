import sinon from 'sinon';

import { RevokedUserAccess } from '../../../../src/identity-access-management/domain/models/RevokedUserAccess.js';
import { revokedUserAccessRepository } from '../../../../src/identity-access-management/infrastructure/repositories/revoked-user-access.repository.js';
import {
  schemes,
  validateClientApplicationAccessToken,
  validateUserAccessToken,
} from '../../../../src/identity-access-management/infrastructure/server-authentication.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { ForwardedOriginError } from '../../../../src/shared/infrastructure/utils/network.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | serverAuthentication', function () {
  beforeEach(function () {
    sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
    sinon.stub(tokenService, 'getDecodedToken');
  });

  describe('when there is no authorization header in the request', function () {
    it('should throw an error', async function () {
      // given
      const request = { headers: {} };
      const h = { authenticated: sinon.stub() };

      // when
      const { authenticate } = schemes.jwt.scheme(undefined, {
        key: 'dummy-secret',
        validate: sinon.stub(),
      });
      const response = await authenticate(request, h);

      // then
      expect(response.output.payload).to.include({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
      });
    });
  });

  describe('when there is an authorization header in the request', function () {
    describe('when there is no access token in the authorization header', function () {
      it('should throw an error', async function () {
        // given
        const request = { headers: { authorization: 'Bearer' } };
        const h = { authenticated: sinon.stub() };
        tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer').returns(null);

        // when
        const { authenticate } = schemes.jwt.scheme(undefined, {
          key: 'dummy-secret',
          validate: sinon.stub(),
        });
        const response = await authenticate(request, h);

        // then
        expect(response.output.payload).to.include({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Unauthorized',
        });
      });
    });

    describe('when access token can not be decoded', function () {
      it('should throw an error', async function () {
        // given
        const request = {
          headers: { authorization: 'Bearer token', 'x-forwarded-proto': 'https', 'x-forwarded-host': 'app.pix.fr' },
        };
        const h = { authenticated: sinon.stub() };
        tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
        tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns(false);

        // when
        const { authenticate } = schemes.jwt.scheme(undefined, {
          key: 'dummy-secret',
          validate: sinon.stub(),
        });
        const response = await authenticate(request, h);

        // then
        expect(response.output.payload).to.include({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Unauthorized',
        });
      });
    });
  });

  describe('#validateUserAccessToken', function () {
    describe('when there is no user Id', function () {
      it('should throw an error', async function () {
        // given
        const request = {
          headers: {
            authorization: 'Bearer token',
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'app.pix.fr',
          },
        };
        const h = { authenticated: sinon.stub() };
        tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
        tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns({
          aud: 'https://app.pix.fr',
        });

        // when
        const { authenticate } = schemes.jwt.scheme(undefined, {
          key: 'dummy-secret',
          validate: (decodedAccessToken, options) =>
            validateUserAccessToken(decodedAccessToken, {
              ...options,
              revokedUserAccessRepository,
            }),
        });
        const response = await authenticate(request, h);

        // then
        expect(response.output.payload).to.include({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Unauthorized',
        });
      });
    });

    describe('when there is a user Id', function () {
      describe('when the audience is different from the forwarded origin', function () {
        it('should throw an error', async function () {
          // given
          const request = {
            headers: {
              authorization: 'Bearer token',
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'app.pix.fr',
            },
          };
          const h = { authenticated: sinon.stub() };
          tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
          tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns({
            user_id: 'user_id',
            aud: 'https://wrong.audience.fr',
          });

          // when
          const { authenticate } = schemes.jwt.scheme(undefined, {
            key: 'dummy-secret',
            validate: (decodedAccessToken, options) =>
              validateUserAccessToken(decodedAccessToken, {
                ...options,
                revokedUserAccessRepository,
              }),
          });
          const response = await authenticate(request, h);

          // then
          expect(response.output.payload).to.include({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
          });
        });
      });

      describe('when the user access is revoked', function () {
        it('should throw an error', async function () {
          // given
          const date = new Date();
          const revokedUserAccess = new RevokedUserAccess(date.getTime() / 1000);
          sinon.stub(revokedUserAccessRepository, 'findByUserId').resolves(revokedUserAccess);
          sinon.stub(revokedUserAccess, 'isAccessTokenRevoked').returns(true);

          const request = {
            headers: {
              authorization: 'Bearer token',
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'app.pix.fr',
            },
          };
          const h = { authenticated: sinon.stub() };
          tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
          tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns({
            user_id: 'user_id',
            aud: 'https://app.pix.fr',
          });

          // when
          const { authenticate } = schemes.jwt.scheme(undefined, {
            key: 'dummy-secret',
            validate: (decodedAccessToken, options) =>
              validateUserAccessToken(decodedAccessToken, {
                ...options,
                revokedUserAccessRepository,
              }),
          });
          const response = await authenticate(request, h);

          // then
          expect(h.authenticated).to.not.have.been.called;
          expect(response.output.payload).to.include({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Unauthorized',
          });
        });
      });

      describe('when there is no forwarded origin in the request', function () {
        it('should throw an error', async function () {
          // given
          const request = {
            headers: {
              authorization: 'Bearer token',
            },
          };

          const h = { authenticated: sinon.stub() };
          tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
          tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns({
            user_id: 'user_id',
            aud: 'https://app.pix.fr',
          });

          // when & then
          const { authenticate } = schemes.jwt.scheme(undefined, {
            key: 'dummy-secret',
            validate: (decodedAccessToken, options) =>
              validateUserAccessToken(decodedAccessToken, {
                ...options,
                revokedUserAccessRepository,
              }),
          });
          await expect(authenticate(request, h)).to.be.rejectedWith(ForwardedOriginError);
        });
      });

      describe('when the audience is the same than the forwarded origin', function () {
        it('should not throw an error', async function () {
          // given
          const request = {
            headers: {
              authorization: 'Bearer token',
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'app.pix.fr',
            },
          };
          const h = { authenticated: sinon.stub() };
          tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
          tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns({
            user_id: 'user_id',
            aud: 'https://app.pix.fr',
          });

          // when
          const { authenticate } = schemes.jwt.scheme(undefined, {
            key: 'dummy-secret',
            validate: (decodedAccessToken, options) =>
              validateUserAccessToken(decodedAccessToken, {
                ...options,
                revokedUserAccessRepository,
              }),
          });
          await authenticate(request, h);

          // then
          expect(h.authenticated).to.have.been.calledWithExactly({ credentials: { userId: 'user_id' } });
        });
      });
    });
  });

  describe('#validateClientApplicationAccessToken', function () {
    describe('when there is a clientId', function () {
      it('should call h.authenticated with credentials', async function () {
        const request = { headers: { authorization: 'Bearer token' } };
        const h = { authenticated: sinon.stub() };
        const decodedAccessToken = {
          client_id: 'client_id',
          scope: 'scope1 scope2',
          source: 'source',
        };

        const expectedCredentials = {
          client_id: 'client_id',
          scope: ['scope1', 'scope2'],
          source: 'source',
        };
        tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
        tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns(decodedAccessToken);

        const { authenticate } = schemes.jwt.scheme(undefined, {
          key: 'dummy-secret',
          validate: validateClientApplicationAccessToken,
        });
        await authenticate(request, h);

        // then
        expect(h.authenticated).to.have.been.calledWithExactly({ credentials: expectedCredentials });
      });
    });

    describe('when there is no clientId', function () {
      it('should return Unauthorized', async function () {
        const request = { headers: { authorization: 'Bearer token' } };
        const h = { authenticated: sinon.stub() };
        const decodedAccessToken = {
          scope: 'scope',
          source: 'source',
        };
        tokenService.extractTokenFromAuthorizationHeader.withArgs('Bearer token').returns('token');
        tokenService.getDecodedToken.withArgs('token', 'dummy-secret').returns(decodedAccessToken);

        const { authenticate } = schemes.jwt.scheme(undefined, {
          key: 'dummy-secret',
          validate: validateClientApplicationAccessToken,
        });
        const response = await authenticate(request, h);

        // then
        expect(h.authenticated).to.not.have.been.called;
        expect(response.output.payload).to.include({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Unauthorized',
        });
      });
    });
  });
});
