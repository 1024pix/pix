const { expect, sinon } = require('../../../test-helper');
const getIdentityProviders = require('../../../../lib/domain/usecases/get-identity-providers');
const OidcIdentityProviders = require('../../../../lib/domain/constants/oidc-identity-providers');
const config = require('../../../../lib/config');

describe('Unit | UseCase | get-identity-providers', function () {
  beforeEach(function () {
    sinon.stub(config, 'poleEmploi').value({
      clientId: 'client id pole emploi',
      clientSecret: 'client secret pole emploi',
      tokenUrl: 'http://token.url',
      sendingUrl: 'http://sending.url',
      userInfoUrl: 'http://user.info.url',
      authenticationUrl: 'http://authentication.url',
      logoutUrl: 'http://logout.url',
      afterLogoutUrl: 'http://after.logout.url',
    });
    sinon.stub(config, 'cnav').value({
      clientId: 'client id cnav',
      authenticationUrl: 'http://authentication.url',
      userInfoUrl: 'http://user.info.url',
      tokenUrl: 'http://token.url',
      clientSecret: 'client secret cnav',
      accessTokenLifespanMs: 1000,
    });
    sinon.stub(config, 'fwb').value({});
  });

  afterEach(function () {
    sinon.restore();
  });

  it('returns all identity providers', async function () {
    // given & when
    const identityProviders = getIdentityProviders();

    // then
    const expectedIdentityProviders = [OidcIdentityProviders.POLE_EMPLOI.service, OidcIdentityProviders.CNAV.service];
    expect(identityProviders.length).to.equal(2);
    expect(identityProviders).to.deep.equal(expectedIdentityProviders);
  });

  context('when an identity provider is not configured', function () {
    it('returns only configured identity providers', function () {
      // given
      sinon.stub(config, 'cnav').value({});

      // when
      const identityProviders = getIdentityProviders();

      // then
      const expectedIdentityProviders = [OidcIdentityProviders.POLE_EMPLOI.service];
      expect(identityProviders.length).to.equal(1);
      expect(identityProviders).to.deep.equal(expectedIdentityProviders);
    });
  });
});
