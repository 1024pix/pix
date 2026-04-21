import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Domain | Usecases | ListLtiPublicKeys', function () {
  it('should return LTI public keys', async function () {
    const keyPair1 = await cryptoService.generateJSONWebKeyPair();
    databaseBuilder.factory.buildLtiPlatformRegistration({
      clientId: 'client1',
      publicKey: keyPair1.publicKey,
    });
    const keyPair2 = await cryptoService.generateJSONWebKeyPair();
    databaseBuilder.factory.buildLtiPlatformRegistration({
      clientId: 'client2',
      publicKey: keyPair2.publicKey,
    });
    await databaseBuilder.commit();

    const keys = await usecases.listLtiPublicKeys();

    expect(keys).to.deep.equal([keyPair1.publicKey, keyPair2.publicKey]);
  });
});
