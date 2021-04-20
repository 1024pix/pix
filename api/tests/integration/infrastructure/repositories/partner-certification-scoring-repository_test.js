const _ = require('lodash');
const { expect, databaseBuilder, domainBuilder, knex, sinon, mockLearningContent } = require('../../../test-helper');
const partnerCertificationScoringRepository = require('../../../../lib/infrastructure/repositories/partner-certification-scoring-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const CleaCertificationScoring = require('../../../../lib/domain/models/CleaCertificationScoring');

describe('Integration | Repository | Partner Certification Scoring', function() {
  const PARTNER_CERTIFICATIONS_TABLE_NAME = 'partner-certifications';

  describe('#save', () => {
    let partnerCertificationScoring;

    beforeEach(() => {
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      partnerCertificationScoring = domainBuilder.buildCleaCertificationScoring({
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should persist the certification partner in db', async () => {
      // given
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const partnerCertificationSaved = await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).first().select();
      expect(partnerCertificationSaved).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: true,
      });
    });

  });

  describe('#buildCleaCertificationScoring', () => {
    const pixValue = 5;
    const competenceId = 'recCompetence1';
    const reproducibilityRate = 13;
    const certificationCourseId = 51;
    const skill = {
      id: 'recSkill0',
      pixValue,
      competenceId,
      status: 'actif',
    };
    const learningContent = { skills: [skill] };

    beforeEach(() => {
      mockLearningContent(learningContent);
    });

    it('should successfully build a CleaCertificationScoring with no clea competenceMarks', async () => {
      // given
      const { userId } = await _setUpCleaCertificationScoringWithBadge({ certificationCourseId, competenceId: 'otherCompetenceId', skill });

      const expectedCleaCertificationScoring = new CleaCertificationScoring({
        certificationCourseId,
        hasAcquiredBadge: true,
        reproducibilityRate,
        cleaCompetenceMarks: [],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
        certificationCourseId, userId, reproducibilityRate, skillRepository,
      });

      // then
      expect(cleaCertificationScoring).to.be.instanceOf(CleaCertificationScoring);
      expect(cleaCertificationScoring).to.deep.equal(expectedCleaCertificationScoring);
    });

    it('should successfully build a CleaCertificationScoring with no competences for CleA', async () => {
      // given
      const { userId } = await _setUpNotExistingCleaCertificationScoring({ certificationCourseId, competenceId: 'otherCompetenceId' });

      const expectedCleaCertificationScoring = new CleaCertificationScoring({
        certificationCourseId,
        hasAcquiredBadge: false,
        reproducibilityRate,
        cleaCompetenceMarks: [],
        maxReachablePixByCompetenceForClea: { },
      });

      // when
      const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
        certificationCourseId, userId, reproducibilityRate, skillRepository,
      });

      // then
      expect(cleaCertificationScoring).to.be.instanceOf(CleaCertificationScoring);
      expect(cleaCertificationScoring).to.deep.equal(expectedCleaCertificationScoring);
    });

    it('should successfully build a CleaCertificationScoring with badge', async () => {
      // given

      const { userId, competenceMark } = await _setUpCleaCertificationScoringWithBadge({ certificationCourseId, competenceId, skill });

      const expectedCleaCertificationScoring = new CleaCertificationScoring({
        certificationCourseId,
        hasAcquiredBadge: true,
        reproducibilityRate,
        cleaCompetenceMarks: [_.omit(competenceMark, 'createdAt')],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
        certificationCourseId, userId, reproducibilityRate, skillRepository,
      });

      // then
      expect(cleaCertificationScoring).to.be.instanceOf(CleaCertificationScoring);
      expect(cleaCertificationScoring).to.deep.equal(expectedCleaCertificationScoring);
    });

    it('should successfully build a cleaCertificationScoring without badge', async () => {
      // given
      const { userId, competenceMark } = await _setUpCleaCertificationScoringWithoutBadge({ certificationCourseId, competenceId, skill });

      const expectedCleaCertificationScoring = new CleaCertificationScoring({
        certificationCourseId,
        hasAcquiredBadge: false,
        reproducibilityRate,
        cleaCompetenceMarks: [_.omit(competenceMark, 'createdAt')],
        maxReachablePixByCompetenceForClea: { [competenceId]: pixValue },
      });

      // when
      const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
        certificationCourseId, userId, reproducibilityRate, skillRepository,
      });

      // then
      expect(cleaCertificationScoring).to.be.instanceOf(CleaCertificationScoring);
      expect(cleaCertificationScoring).to.deep.equal(expectedCleaCertificationScoring);
    });
  });

});

async function _setUpCleaCertificationScoringWithoutBadge({ certificationCourseId, competenceId, skill }) {
  return _setUpCleaCertificationScoring({ certificationCourseId, competenceId, skill, withBadge: true, badgeAcquired: false });
}

async function _setUpCleaCertificationScoringWithBadge({ certificationCourseId, competenceId, skill }) {
  return _setUpCleaCertificationScoring({ certificationCourseId, competenceId, skill, withBadge: true, badgeAcquired: true });
}

async function _setUpNotExistingCleaCertificationScoring({ certificationCourseId, competenceId }) {
  return _setUpCleaCertificationScoring({ certificationCourseId, competenceId, skill: null, withBadge: false });
}

async function _setUpCleaCertificationScoring({ certificationCourseId, competenceId, skill, withBadge, badgeAcquired }) {

  const badgeCompetenceName = 'badgeCompetenceName';
  const userId = databaseBuilder.factory.buildUser().id;
  databaseBuilder.factory.buildCertificationCourse({
    userId,
    id: certificationCourseId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
  const competenceMark = databaseBuilder.factory.buildCompetenceMark(
    {
      assessmentResultId,
      competenceId,
    },
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
    competenceMark,
  };
}
