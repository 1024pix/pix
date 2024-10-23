import * as habilitationRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/habilitation-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | habilitation-repository', function () {
  describe('deleteAllByComplementaryKey', function () {
    it('should delete habilitation', async function () {
      // given
      const clea = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
      });
      const aRandomComplementary = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      });

      const center = databaseBuilder.factory.buildCertificationCenter();
      const anotherCenter = databaseBuilder.factory.buildCertificationCenter();

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: center.id,
        complementaryCertificationId: clea.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: anotherCenter.id,
        complementaryCertificationId: aRandomComplementary.id,
      });
      await databaseBuilder.commit();

      // when
      const numberOfDeletions = await habilitationRepository.deleteAllByComplementaryKey({
        keys: [ComplementaryCertificationKeys.PIX_PLUS_DROIT],
      });

      // then
      expect(numberOfDeletions).to.equal(1);
    });
  });
});
