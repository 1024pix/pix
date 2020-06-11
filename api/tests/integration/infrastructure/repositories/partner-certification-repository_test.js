const { expect, databaseBuilder, domainBuilder, knex, sinon, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const CleaCertification = require('../../../../lib/domain/models/CleaCertification');

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

  describe('#buildCleaCertification', () => {
    const skill = airtableBuilder.factory.buildSkill();

    before(() => {
      airtableBuilder.mockList({ tableName: 'Acquis' })
        .returns([skill])
        .activate();
    });

    after(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should successfully build a cleaCertification', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });
      const badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
      databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId, skillIds: [ skill.id ] });
      databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId });
      await databaseBuilder.commit();

      // when
      const cleaCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId, userId, reproducibilityRate: 13,
      });

      // then
      expect(cleaCertification).to.be.instanceOf(CleaCertification);
    });
  });

});
