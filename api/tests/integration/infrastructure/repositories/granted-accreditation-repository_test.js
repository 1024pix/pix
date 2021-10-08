const { expect, databaseBuilder } = require('../../../test-helper');
const grantedAccreditationRepository = require('../../../../lib/infrastructure/repositories/granted-accreditation-repository');
const { knex } = require('../../../../lib/infrastructure/bookshelf');

describe('Integration | Infrastructure | Repository | granted-accreditation-repository', function () {
  context('#save', function () {
    afterEach(function () {
      return knex('granted-accreditations').delete();
    });

    it('should create the granted accreditation', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const accreditationId = databaseBuilder.factory.buildAccreditation().id;
      await databaseBuilder.commit();

      // when
      await grantedAccreditationRepository.save({
        certificationCenterId,
        accreditationId,
      });

      // then
      const grantedAccreditation = await knex
        .select('*')
        .from('granted-accreditations')
        .where({ certificationCenterId, accreditationId })
        .first();
      expect(grantedAccreditation).to.not.be.null;
    });
  });

  context('#deleteByCertificationCenterId', function () {
    it('should delete all granted accreditations for a given certification center id', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const accreditation1Id = databaseBuilder.factory.buildAccreditation().id;
      const accreditation2Id = databaseBuilder.factory.buildAccreditation().id;
      const otherAccreditationId = databaseBuilder.factory.buildAccreditation().id;
      databaseBuilder.factory.buildGrantedAccreditation({
        certificationCenterId,
        accreditationId: accreditation1Id,
      });
      databaseBuilder.factory.buildGrantedAccreditation({
        certificationCenterId,
        accreditationId: accreditation2Id,
      });
      databaseBuilder.factory.buildGrantedAccreditation({
        certificationCenterId: otherCertificationCenterId,
        accreditationId: otherAccreditationId,
      });
      await databaseBuilder.commit();

      // when
      await grantedAccreditationRepository.deleteByCertificationCenterId(certificationCenterId);

      // then
      const grantedAccreditationsForCertificationCenterId = await knex
        .select('*')
        .from('granted-accreditations')
        .where({ certificationCenterId });
      expect(grantedAccreditationsForCertificationCenterId.length).to.equal(0);
      const grantedAccreditationThatShouldHaveBeenDeleted = await knex
        .select('*')
        .from('granted-accreditations')
        .where({ certificationCenterId: otherCertificationCenterId });
      expect(grantedAccreditationThatShouldHaveBeenDeleted.length).to.equal(1);
    });
  });
});
