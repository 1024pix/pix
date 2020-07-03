const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, knex, sinon, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
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
      await partnerCertificationRepository.save({ partnerCertification });

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
    const pixValue = 5;
    const competenceId = 'recCompetence1';
    const reproducibilityRate = 13;
    const certificationCourseId = 51;
    const skill = airtableBuilder.factory.buildSkill({ pixValue, compétenceViaTube: [competenceId] });

    before(() => {
      airtableBuilder.mockList({ tableName: 'Acquis' })
        .returns([skill])
        .activate();
    });

    after(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    it('should successfully build a CleaCertification with no clea competenceMarks', async () => {
      // given
      const { userId } = await _setUpCleaCertificationWithBadge({ certificationCourseId, competenceId: 'otherCompetenceId', skill });

      const expectedCleaCertification = new CleaCertification({
        certificationCourseId,
        hasAcquiredBadge: true,
        reproducibilityRate,
        cleaCompetenceMarks: [],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId, userId, reproducibilityRate, skillRepository
      });

      // then
      expect(cleaCertification).to.be.instanceOf(CleaCertification);
      expect(cleaCertification).to.deep.equal(expectedCleaCertification);
    });

    it('should successfully build a CleaCertification with no competences for CleA', async () => {
      // given
      const { userId } = await _setUpNotExistingCleaCertification({ certificationCourseId, competenceId: 'otherCompetenceId' });

      const expectedCleaCertification = new CleaCertification({
        certificationCourseId,
        hasAcquiredBadge: false,
        reproducibilityRate,
        cleaCompetenceMarks: [],
        maxReachablePixByCompetenceForClea: { },
      });

      // when
      const cleaCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId, userId, reproducibilityRate, skillRepository
      });

      // then
      expect(cleaCertification).to.be.instanceOf(CleaCertification);
      expect(cleaCertification).to.deep.equal(expectedCleaCertification);
    });

    it('should successfully build a CleaCertification with badge', async () => {
      // given

      const { userId, competenceMark } = await _setUpCleaCertificationWithBadge({ certificationCourseId, competenceId, skill });

      const expectedCleaCertification = new CleaCertification({
        certificationCourseId,
        hasAcquiredBadge: true,
        reproducibilityRate,
        cleaCompetenceMarks: [_.omit(competenceMark, 'createdAt')],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId, userId, reproducibilityRate, skillRepository
      });

      // then
      expect(cleaCertification).to.be.instanceOf(CleaCertification);
      expect(cleaCertification).to.deep.equal(expectedCleaCertification);
    });

    it('should successfully build a cleaCertification without badge', async () => {
      // given
      const { userId, competenceMark } = await _setUpCleaCertificationWithoutBadge({ certificationCourseId, competenceId, skill });

      const expectedCleaCertification = new CleaCertification({
        certificationCourseId,
        hasAcquiredBadge: false,
        reproducibilityRate,
        cleaCompetenceMarks: [_.omit(competenceMark, 'createdAt')],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId, userId, reproducibilityRate, skillRepository
      });

      // then
      expect(cleaCertification).to.be.instanceOf(CleaCertification);
      expect(cleaCertification).to.deep.equal(expectedCleaCertification);
    });
  });

});

async function _setUpCleaCertificationWithoutBadge({ certificationCourseId, competenceId, skill }) {
  return _setUpCleaCertification({ certificationCourseId, competenceId, skill, withBadge: true, badgeAcquired: false });
}

async function _setUpCleaCertificationWithBadge({ certificationCourseId, competenceId, skill }) {
  return _setUpCleaCertification({ certificationCourseId, competenceId, skill, withBadge: true, badgeAcquired: true });
}

async function _setUpNotExistingCleaCertification({ certificationCourseId, competenceId }) {
  return _setUpCleaCertification({ certificationCourseId, competenceId, skill: null, withBadge: false });
}

async function _setUpCleaCertification({ certificationCourseId, competenceId, skill, withBadge, badgeAcquired }) {

  const badgeCompetenceName = 'badgeCompetenceName';
  const userId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildCertificationCourse({
    userId,
    id: certificationCourseId
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
  const competenceMark = databaseBuilder.factory.buildCompetenceMark(
    {
      assessmentResultId,
      competenceId
    }
  );

  if (withBadge) {
    const badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
    databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId, skillIds: [skill.id], name: badgeCompetenceName });
    if (badgeAcquired) {
      databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId });
    }
  }
  await databaseBuilder.commit();
  return {
    userId,
    competenceMark
  };
}
