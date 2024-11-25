import * as complementaryCertificationHabilitationRepository from '../../../../../src/organizational-entities/infrastructure/repositories/complementary-certification-habilitation.repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | complementary-certification-habilitation', function () {
  context('#save', function () {
    it('creates the complementary certitification habilitation', async function () {
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
    it('deletes all complementary certitification habilitations for a given certification center id', async function () {
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
      expect(complementaryCertificationHabilitationsForCertificationCenterId).to.have.lengthOf(0);
      const complementaryCertificationHabilitationThatShouldHaveBeenDeleted = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId: otherCertificationCenterId });
      expect(complementaryCertificationHabilitationThatShouldHaveBeenDeleted).to.have.lengthOf(1);
    });
  });
});
