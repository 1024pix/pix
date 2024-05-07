import { getAuthorizationUrl } from '../../../../../src/identity-access-management/domain/usecases/get-authorization-url.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | get-authorization-url', function () {
  it('returns the generated authorization url', async function () {
    // given
    const audience = 'app';
    const identityProvider = 'OIDC';
    const oidcAuthenticationService = {
      getAuthorizationUrl: sinon.stub().returns('https://authorization.url'),
    };
    const oidcAuthenticationServiceRegistry = {
      loadOidcProviderServices: sinon.stub().resolves(),
      configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
      getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
    };

    oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode.withArgs({
      identityProviderCode: identityProvider,
    });

    // when
    const authorizationUrl = await getAuthorizationUrl({
      audience,
      identityProvider,
      oidcAuthenticationServiceRegistry,
    });

    // then
    expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnce;
    expect(oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode).to.have.been.calledWithExactly(
      identityProvider,
    );
    expect(oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode).to.have.been.calledWithExactly({
      identityProviderCode: 'OIDC',
      audience: 'app',
    });
    expect(oidcAuthenticationService.getAuthorizationUrl).to.have.been.calledOnce;
    expect(authorizationUrl).to.equal('https://authorization.url');
  });
});
