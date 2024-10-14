import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import { getByKey } from '../../../../../src/profile/infrastructure/repositories/attestation-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Profile | Integration | Infrastructure | Repository | Attestation', function () {
  describe('#getByKey', function () {
    it('should return attestation informations for given key', async function () {
      // given
      const templateName = 'Velodrome';
      const attestation = databaseBuilder.factory.buildAttestation({ templateName });
      await databaseBuilder.commit();

      // when
      const result = await getByKey({ attestationKey: attestation.key });

      // then

      expect(result).to.be.an.instanceof(Attestation);
      expect(result.templateName).to.equal(templateName);
    });

    it('should return null if no attestation exist for given key', async function () {
      // given&when
      const result = await getByKey({ attestationKey: 'BAD_KEY' });

      // then
      expect(result).to.be.null;
    });
  });
});
