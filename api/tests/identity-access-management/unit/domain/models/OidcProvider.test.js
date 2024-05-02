import { OidcProvider } from '../../../../../src/identity-access-management/domain/models/OidcProvider.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | OidcProvider', function () {
  describe('#decryptClientSecret', function () {
    it('sets clientSecret with decrypted client secret', async function () {
      // given
      const cryptoService = {
        decrypt: sinon.stub().resolves('decryptedClientSecret'),
      };
      const oidcProvider = new OidcProvider({
        encryptedClientSecret: 'encryptedClientSecret',
      });

      // when
      await oidcProvider.decryptClientSecret(cryptoService);

      // then
      expect(oidcProvider.clientSecret).to.equal('decryptedClientSecret');
      expect(cryptoService.decrypt).to.have.been.calledWithExactly('encryptedClientSecret');
    });
  });
});
