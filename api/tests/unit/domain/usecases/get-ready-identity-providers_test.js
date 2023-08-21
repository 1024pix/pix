import { expect, sinon } from '../../../test-helper.js';
import { getReadyIdentityProviders } from '../../../../lib/domain/usecases/get-ready-identity-providers.js';

describe('Unit | UseCase | get-ready-identity-providers', function () {
  it('returns oidc providers from authenticationServiceRegistry', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const authenticationServiceRegistryStub = {
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getReadyIdentityProviders({
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
