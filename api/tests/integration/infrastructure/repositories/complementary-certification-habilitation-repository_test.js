import { knex } from '../../../../lib/infrastructure/bookshelf.js';
import * as complementaryCertificationHabilitationRepository from '../../../../lib/infrastructure/repositories/complementary-certification-habilitation-repository.js';
import { databaseBuilder, expect } from '../../../test-helper.js';

describe('Integration | Infrastructure | Repository | complementary-certification-habilitation-repository', function () {
  context('#save', function () {
    it('should create the complementary certitification habilitation', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      await databaseBuilder.commit();

      // when
      await complementaryCertificationHabilitationRepository.save({
        certificationCenterId,
        complementaryCertificationId,
      });

      // then
      const complementaryCertificationHabilitation = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId, complementaryCertificationId })
        .first();
      expect(complementaryCertificationHabilitation).to.not.be.null;
    });
  });

  context('#deleteByCertificationCenterId', function () {
    it('should delete all complementary certitification habilitations for a given certification center id', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const complementaryCertification1Id = databaseBuilder.factory.buildComplementaryCertification({ key: 'A' }).id;
      const complementaryCertification2Id = databaseBuilder.factory.buildComplementaryCertification({ key: 'B' }).id;
      const otherComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        key: 'C',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertification1Id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertification2Id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: otherCertificationCenterId,
        complementaryCertificationId: otherComplementaryCertificationId,
      });
      await databaseBuilder.commit();

      // when
      await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenterId);

      // then
      const complementaryCertificationHabilitationsForCertificationCenterId = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId });
      expect(complementaryCertificationHabilitationsForCertificationCenterId.length).to.equal(0);
      const complementaryCertificationHabilitationThatShouldHaveBeenDeleted = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId: otherCertificationCenterId });
      expect(complementaryCertificationHabilitationThatShouldHaveBeenDeleted.length).to.equal(1);
    });
  });
});
