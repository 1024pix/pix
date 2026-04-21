import sinon from 'sinon';

import { getAuthorizationUrl } from '../../../../../src/identity-access-management/domain/usecases/get-authorization-url.usecase.js';

describe('Unit | Identity Access Management | Domain | UseCases | get-authorization-url', function () {
  it('returns the generated authorization url', async function () {
    // given
    const identityProvider = 'OIDC';
    const oidcAuthenticationService = {
      getAuthorizationUrl: sinon.stub().returns('https://authorization.url'),
    };
    const oidcAuthenticationServiceRegistry = {
      getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
    };

    oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode.withArgs({
      identityProviderCode: identityProvider,
    });

    // when
    const authorizationUrl = await getAuthorizationUrl({
      identityProvider,
      oidcAuthenticationServiceRegistry,
    });

    // then
    expect(oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode).to.have.been.calledWithExactly({
      identityProviderCode: 'OIDC',
      requestedApplication: undefined,
    });
    expect(oidcAuthenticationService.getAuthorizationUrl).to.have.been.calledOnce;
    expect(authorizationUrl).to.equal('https://authorization.url');
  });
});
