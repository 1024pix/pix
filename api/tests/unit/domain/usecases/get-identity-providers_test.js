import { getIdentityProviders } from '../../../../lib/domain/usecases/get-identity-providers.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-identity-providers', function () {
  it('returns oidc providers from authenticationServiceRegistry', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const authenticationServiceRegistryStub = {
      getOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getIdentityProviders({
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
