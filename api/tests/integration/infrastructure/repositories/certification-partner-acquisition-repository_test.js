const { expect, databaseBuilder, knex } = require('../../../test-helper');
const certificationPartnerAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certification-partner-acquisition-repository');

const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');

describe('Integration | Repository | Certification Partner Acquisition', function() {

  describe('#save', () => {
    let certificationPartnerAcquisition;

    beforeEach(() => {
      const buildBadge = databaseBuilder.factory.buildBadge();
      const partnerKey = buildBadge.key;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      certificationPartnerAcquisition = new CertificationPartnerAcquisition({
        certificationCourseId, partnerKey
      });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('certification-partner-acquisitions').delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should persist the certification partner acquisition in db', async () => {
      // when
      await certificationPartnerAcquisitionRepository.save(certificationPartnerAcquisition);

      // then
      const certificationPartnerAcquisitionSaved = await knex('certification-partner-acquisitions').select();
      expect(certificationPartnerAcquisitionSaved).to.have.lengthOf(1);
    });

  });

});
