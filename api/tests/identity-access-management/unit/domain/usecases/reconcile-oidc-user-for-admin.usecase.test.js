import sinon from 'sinon';

import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { reconcileOidcUserForAdmin } from '../../../../../src/identity-access-management/domain/usecases/reconcile-oidc-user-for-admin.usecase.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | reconcile-oidc-user-for-admin', function () {
  const identityProvider = 'genericOidcProviderCode';
  const audience = 'https://admin.pix.fr';

  let authenticationMethodRepository;
  let userRepository;
  let authenticationSessionService;
  let oidcAuthenticationService;

  beforeEach(function () {
    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };
    userRepository = { getByEmail: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub() };
    oidcAuthenticationService = {
      identityProvider,
      createAccessToken: sinon.stub(),
      createAuthenticationComplement: sinon.stub(),
    };
  });

  context('when authentication key is expired', function () {
    it('throws an AuthenticationKeyExpired', async function () {
      // given
      authenticationSessionService.getByKey.resolves(null);

      // when
      const error = await catchErr(reconcileOidcUserForAdmin)({
        authenticationKey: 'authenticationKey',
        audience,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when user has an oidc authentication method and external identifiers are different', function () {
    it('throws an DifferentExternalIdentifierError', async function () {
      // given
      const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withIdentityProvider({
        externalIdentifier: '789fge',
        identityProvider: 'genericOidcProviderCode',
      });
      userRepository.getByEmail.resolves({ email: 'anne@example.net', id: 1 });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
      authenticationSessionService.getByKey.resolves({
        sessionContent: {},
        userInfo: { externalIdentityId: '123abc' },
      });

      // when
      const error = await catchErr(reconcileOidcUserForAdmin)({
        authenticationKey: 'authenticationKey',
        email: 'anne@example.net',
        identityProvider: 'genericOidcProviderCode',
        audience,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(DifferentExternalIdentifierError);
    });
  });
});
