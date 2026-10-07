import { expect } from 'chai';
import sinon from 'sinon';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { RequestedApplication } from '../../../../../src/shared/infrastructure/utils/network.js';
import { createMockedTestOidcProviders } from '../../../../tooling/mocks/openid-client.mock.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');

describe('Integration | Identity Access Management | Domain | UseCase | logout-oidc-user', function () {
  beforeEach(async function () {
    await revokedUserAccessTemporaryStorage.flushAll();
  });

  it('revokes user’s session given a user ID and session ID and returns a redirectLogoutUrl', async function () {
    // given
    const userId = '1234';
    const sessionId = '6789';

    const logoutUrlUUID = 'some dummy value';
    const sessionTemporaryStorage = {
      save: sinon.stub().resolves(`${userId}:${logoutUrlUUID}`),
    };

    const identityProvider = 'OIDC_LOGOUT_EXAMPLE_NET';
    const [openIdClientMock] = await createMockedTestOidcProviders([
      {
        application: 'orga',
        applicationTld: '.org',
        identityProvider,
        slug: 'oidc-logout-example-net',
        shouldCloseSession: true,
        postLogoutRedirectUri: 'https://orga.pix.org/connexion/oidc-logout-example-net',
      },
    ]);
    openIdClientMock.buildEndSessionUrl.resolves('https://super-it-works.example.net/');

    const audience = 'https://orga.pix.org';
    const requestedApplication = RequestedApplication.fromOrigin(audience);

    // when
    const result = await usecases.logoutOidcUser({
      userId,
      sessionId,
      identityProvider,
      logoutUrlUUID,
      requestedApplication,
      sessionTemporaryStorage,
    });

    // then
    expect(result).to.equal('https://super-it-works.example.net/');

    const revokedKeys = await revokedUserAccessTemporaryStorage.keys(`${userId}:*`);
    expect(revokedKeys).to.deep.equal([`${userId}:${sessionId}`]);
  });
});
