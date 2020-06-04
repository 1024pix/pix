const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const CleaCertification = require('../../../../lib/domain/models/CleaCertification');

describe('Integration | Repository | Partner Certification', function() {
  const PARTNER_CERTIFICATIONS_TABLE_NAME = 'partner-certifications';

  describe('#save', () => {
    let partnerCertification;

    beforeEach(() => {
      const { key: partnerKey } = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      partnerCertification = new CleaCertification({
        certificationCourseId, partnerKey,
      });

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
