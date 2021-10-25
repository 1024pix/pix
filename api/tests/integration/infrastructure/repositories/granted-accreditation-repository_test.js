const { expect, databaseBuilder } = require('../../../test-helper');
const grantedAccreditationRepository = require('../../../../lib/infrastructure/repositories/granted-accreditation-repository');
const { knex } = require('../../../../lib/infrastructure/bookshelf');

describe('Integration | Infrastructure | Repository | granted-accreditation-repository', function () {
  context('#save', function () {
    afterEach(function () {
      return knex('complementary-certification-habilitations').delete();
    });

    it('should create the granted accreditation', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      await databaseBuilder.commit();

      // when
      await grantedAccreditationRepository.save({
        certificationCenterId,
        accreditationId: complementaryCertificationId,
      });

      // then
      const grantedAccreditation = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId, complementaryCertificationId })
        .first();
      expect(grantedAccreditation).to.not.be.null;
    });
  });

  context('#deleteByCertificationCenterId', function () {
    it('should delete all granted accreditations for a given certification center id', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const complementaryCertification1Id = databaseBuilder.factory.buildComplementaryCertification().id;
      const complementaryCertification2Id = databaseBuilder.factory.buildComplementaryCertification().id;
      const otherComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
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
      await grantedAccreditationRepository.deleteByCertificationCenterId(certificationCenterId);

      // then
      const grantedAccreditationsForCertificationCenterId = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId });
      expect(grantedAccreditationsForCertificationCenterId.length).to.equal(0);
      const grantedAccreditationThatShouldHaveBeenDeleted = await knex
        .select('*')
        .from('complementary-certification-habilitations')
        .where({ certificationCenterId: otherCertificationCenterId });
      expect(grantedAccreditationThatShouldHaveBeenDeleted.length).to.equal(1);
    });
  });
});
