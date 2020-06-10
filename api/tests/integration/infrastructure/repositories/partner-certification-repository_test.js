const { expect, databaseBuilder, domainBuilder, knex, sinon } = require('../../../test-helper');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');

describe('Integration | Repository | Partner Certification', function() {
  const PARTNER_CERTIFICATIONS_TABLE_NAME = 'partner-certifications';

  describe('#save', () => {
    let partnerCertification;

    beforeEach(() => {
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      partnerCertification = domainBuilder.buildCleaCertification({
        certificationCourseId
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertification.partnerKey });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should persist the certification partner in db', async () => {
      // given
      sinon.stub(partnerCertification, 'isAcquired').returns(true);

      // when
      await partnerCertificationRepository.save(partnerCertification);

      // then
      const partnerCertificationSaved = await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).first().select();
      expect(partnerCertificationSaved).to.deep.equal({
        certificationCourseId: partnerCertification.certificationCourseId,
        partnerKey: partnerCertification.partnerKey,
        acquired: true
      });
    });

  });

});
