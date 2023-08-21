import { expect, sinon } from '../../../test-helper.js';
import { getIdentityProviders } from '../../../../lib/domain/usecases/get-identity-providers.js';

describe('Unit | UseCase | get-identity-providers', function () {
  it('returns oidc providers from authenticationServiceRegistry', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const authenticationServiceRegistryStub = {
      getReadyOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getIdentityProviders({
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
