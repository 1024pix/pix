const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const certificationPartnerAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certification-partner-acquisition-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const CertificationCleaAcquisition = require('../../../../lib/domain/models/CertificationCleaAcquisition');

describe('Integration | Repository | Certification Partner Acquisition', function() {

  describe('#save', () => {
    let certificationPartnerAcquisition;

    beforeEach(() => {
      const { key: partnerKey } = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      certificationPartnerAcquisition = new CertificationCleaAcquisition({
        certificationCourseId, partnerKey,
      });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('certification-partner-acquisitions').delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should persist the certification partner acquisition in db', async () => {
      // given
      sinon.stub(certificationPartnerAcquisition, 'isAcquired').returns(true);

      // when
      await certificationPartnerAcquisitionRepository.save(certificationPartnerAcquisition);

      // then
      const certificationPartnerAcquisitionSaved = await knex('certification-partner-acquisitions').first().select();
      expect(certificationPartnerAcquisitionSaved).to.deep.equal({
        certificationCourseId: certificationPartnerAcquisition.certificationCourseId,
        partnerKey: certificationPartnerAcquisition.partnerKey,
        acquired: true
      });
    });

  });

});
