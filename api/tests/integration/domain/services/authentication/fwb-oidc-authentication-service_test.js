const { expect } = require('../../../../test-helper');
const { temporaryStorage } = require('../../../../../lib/infrastructure/temporary-storage');
const FwbOidcAuthenticationService = require('../../../../../lib/domain/services/authentication/fwb-oidc-authentication-service');

const logoutUrlTemporaryStorage = temporaryStorage.withPrefix('logout-url:');

describe('Integration | Domain | Service | fwb-oidc-authentication-service', function () {
  describe('#saveIdToken', function () {
    it('save an idToken and returns an uuid', async function () {
      // given
      const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
      const userId = 123;
      const fwbOidcAuthenticationService = new FwbOidcAuthenticationService();

      // when
      const uuid = await fwbOidcAuthenticationService.saveIdToken({ idToken: 'id_token', userId });

      // then
      expect(uuid.match(uuidPattern)).to.be.ok;
      const idToken = logoutUrlTemporaryStorage.get(`${userId}:${uuid}`);
      expect(idToken).to.deep.equal('id_token');
    });
  });
});
