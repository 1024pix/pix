import { expect, sinon } from '../../../test-helper.js';
import { getAllIdentityProviders } from '../../../../lib/domain/usecases/get-all-identity-providers.js';

describe('Unit | UseCase | get-all-identity-providers', function () {
  it('returns oidc providers from authenticationServiceRegistry', function () {
    // given
    const oneOidcProviderService = {};
    const anotherOidcProviderService = {};
    const authenticationServiceRegistryStub = {
      getAllOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getAllIdentityProviders({
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders).to.deep.equal([oneOidcProviderService, anotherOidcProviderService]);
  });
});
