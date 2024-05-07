import { getRedirectLogoutUrl } from '../../../../../src/identity-access-management/domain/usecases/get-redirect-logout-url.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCases | get-redirect-logout-url', function () {
  it('returns the generated redirect logout url', async function () {
    // given
    const identityProvider = 'OIDC';
    const logoutUrlUUID = '23fbed77-5891-4779-b337-65f57cc58ddf';
    const userId = '1';
    const oidcAuthenticationService = {
      getRedirectLogoutUrl: sinon.stub().returns('https://logout.url'),
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
    const logoutUrl = await getRedirectLogoutUrl({
      identityProvider,
      logoutUrlUUID,
      userId,
      oidcAuthenticationServiceRegistry,
    });

    // then
    expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnce;
    expect(oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode).to.have.been.calledWithExactly(
      identityProvider,
    );
    expect(oidcAuthenticationService.getRedirectLogoutUrl).to.have.been.calledWithExactly({
      userId: '1',
      logoutUrlUUID: '23fbed77-5891-4779-b337-65f57cc58ddf',
    });
    expect(logoutUrl).to.equal('https://logout.url');
  });
});
