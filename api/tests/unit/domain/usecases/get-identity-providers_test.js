import { expect, sinon } from '../../../test-helper.js';
import { getIdentityProviders } from '../../../../lib/domain/usecases/get-identity-providers.js';

describe('Unit | UseCase | get-identity-providers', function () {
  it('returns only ready identity providers', function () {
    // given
    const oneOidcProviderService = { isReady: false };
    const anotherOidcProviderService = { isReady: true };
    const authenticationServiceRegistryStub = {
      getOidcProviderServices: sinon.stub().returns([oneOidcProviderService, anotherOidcProviderService]),
    };

    // when
    const identityProviders = getIdentityProviders({
      authenticationServiceRegistry: authenticationServiceRegistryStub,
    });

    // then
    expect(identityProviders.length).to.equal(1);
    expect(identityProviders).to.deep.equal([anotherOidcProviderService]);
  });
});
