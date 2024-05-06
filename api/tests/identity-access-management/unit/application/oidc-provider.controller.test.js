import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | oidc-provider', function () {
  describe('#getIdentityProviders', function () {
    it('returns the list of oidc identity providers', async function () {
      // given
      sinon.stub(usecases, 'getReadyIdentityProviders').returns([
        {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          organizationName: 'Some OIDC Provider',
          slug: 'some-oidc-provider',
          shouldCloseSession: false,
        },
      ]);

      // when
      const response = await oidcProviderController.getIdentityProviders({ query: { audience: null } }, hFake);

      // then
      expect(usecases.getReadyIdentityProviders).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.length).to.equal(1);
      expect(response.source.data).to.deep.contain({
        type: 'oidc-identity-providers',
        id: 'some-oidc-provider',
        attributes: {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          'organization-name': 'Some OIDC Provider',
          'should-close-session': false,
        },
      });
    });
  });
});
