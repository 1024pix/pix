import { oidcProviderAdminController } from '../../../../src/authentication/application/oidc-provider.admin.controller.js';
import { usecases } from '../../../../src/authentication/domain/usecases/index.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Authentication | Application | Controller | Oidc', function () {
  it('returns an HTTP status code 204', async function () {
    // given
    const oidcProvider1 = {
      identityProvider: 'IDP_1',
      organizationName: 'Hero Academia',
      scope: 'openid profile',
      slug: 'ipd-1',
      source: 'idp_1',
      clientId: 'IDP_1_CLIENT_ID',
      clientSecret: 'IDP_1_CLIENT_SECRET',
      accessTokenLifespan: '7d',
      enabled: true,
      idTokenLifespan: '7d',
      openidConfigurationUrl: 'https://idp-1.fr/connexion/oauth2/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.fr/connexion/idp-1',
      shouldCloseSession: true,
      openidClientExtraMetadata: {
        token_endpoint_auth_method: 'client_secret_post',
      },
      additionalRequiredProperties: {
        logoutUrl: 'https://idp-1.fr/compte/deconnexion',
        afterLogoutUrl: 'https://app.dev.pix.fr',
      },
    };
    const oidcProvider2 = {
      identityProvider: 'IDP_2',
      organizationName: 'Kaisen Academia',
      scope: 'openid profile',
      slug: 'ipd-2',
      source: 'idp_2',
      clientId: 'IDP_2_CLIENT_ID',
      clientSecret: 'IDP_2_CLIENT_SECRET',
      accessTokenLifespan: '7d',
      enabledForPixAdmin: true,
      idTokenLifespan: '7d',
      openidConfigurationUrl: 'https://idp-2.fr/connexion/oauth2/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.fr/connexion/idp-2',
      shouldCloseSession: true,
    };
    const request = {
      headers: {
        'Content-Type': 'application/json',
      },
      payload: [oidcProvider1, oidcProvider2],
    };
    const domainTransaction = Symbol('domain-transaction');

    sinon.stub(usecases, 'addOidcProvider').resolves();
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

    // when
    const response = await oidcProviderAdminController.createInBatch(request, hFake);

    // then
    expect(usecases.addOidcProvider.callCount).to.equal(2);
    expect(usecases.addOidcProvider.getCall(0)).to.have.been.calledWith({
      identityProvider: 'IDP_1',
      organizationName: 'Hero Academia',
      scope: 'openid profile',
      slug: 'ipd-1',
      source: 'idp_1',
      clientId: 'IDP_1_CLIENT_ID',
      clientSecret: 'IDP_1_CLIENT_SECRET',
      accessTokenLifespan: '7d',
      enabled: true,
      idTokenLifespan: '7d',
      openidConfigurationUrl: 'https://idp-1.fr/connexion/oauth2/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.fr/connexion/idp-1',
      shouldCloseSession: true,
      openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
      additionalRequiredProperties: {
        logoutUrl: 'https://idp-1.fr/compte/deconnexion',
        afterLogoutUrl: 'https://app.dev.pix.fr',
      },
      domainTransaction,
    });
    expect(usecases.addOidcProvider.getCall(1)).to.have.been.calledWith({
      identityProvider: 'IDP_2',
      organizationName: 'Kaisen Academia',
      scope: 'openid profile',
      slug: 'ipd-2',
      source: 'idp_2',
      clientId: 'IDP_2_CLIENT_ID',
      clientSecret: 'IDP_2_CLIENT_SECRET',
      accessTokenLifespan: '7d',
      enabledForPixAdmin: true,
      idTokenLifespan: '7d',
      openidConfigurationUrl: 'https://idp-2.fr/connexion/oauth2/.well-known/openid-configuration',
      redirectUri: 'https://app.dev.pix.fr/connexion/idp-2',
      shouldCloseSession: true,
      domainTransaction,
    });
    expect(response.statusCode).to.equal(204);
  });
});
