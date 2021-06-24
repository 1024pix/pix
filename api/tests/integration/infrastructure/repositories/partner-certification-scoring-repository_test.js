const { expect, databaseBuilder, domainBuilder, knex, sinon, mockLearningContent, catchErr } = require('../../../test-helper');
const partnerCertificationScoringRepository = require('../../../../lib/infrastructure/repositories/partner-certification-scoring-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const { NotEligibleCandidateError } = require('../../../../lib/domain/errors');

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

    it('should insert the certification partner in db if it does not already exists', async () => {
      // given
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const partnerCertificationSaved = await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).select();
      expect(partnerCertificationSaved).to.have.length(1);
      expect(partnerCertificationSaved[0]).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: true,
      });
    });

    it('should update the existing certification partner if it exists', async () => {
      // given
      databaseBuilder.factory.buildPartnerCertification({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
      });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(false);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const partnerCertificationSaved = await knex(PARTNER_CERTIFICATIONS_TABLE_NAME).select();
      expect(partnerCertificationSaved).to.have.length(1);
      expect(partnerCertificationSaved[0]).to.deep.equal({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: false,
      });
    });

  });

  describe('#buildCleaCertificationScoring2', () => {

    context('when the user does not have the badge', () => {

      it('should build a CleaCertificationScoring that throws a NotEligibleCandidateError', async () => {
        // given
        const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
        const learningContent = { skills: [skill] };
        mockLearningContent(learningContent);
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
          certificationCourseId,
          userId,
          reproducibilityRate: 75,
          skillRepository,
        });

        // when
        const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

        // then
        expect(error).to.be.instanceOf(NotEligibleCandidateError);
      });
    });

    context('when the user has the badge', () => {
      let userId;
      let certificationCourseId;
      let badgeId;

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA }).id;
        databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId });
        return databaseBuilder.commit();
      });

      context('when user reproducibility rate is below minimum rate', () => {

        it('should build a not acquired CleaCertificationScoring', async () => {
          // given
          const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
          const learningContent = { skills: [skill] };
          mockLearningContent(learningContent);

          // when
          const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
            certificationCourseId,
            userId,
            reproducibilityRate: 10,
            skillRepository,
          });

          // then
          expect(cleaCertificationScoring.isAcquired()).to.be.false;
        });
      });

      context('when user reproducibility rate is above trusted rate', () => {

        it('should build an acquired CleaCertificationScoring', async () => {
          // given
          const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
          const learningContent = { skills: [skill] };
          mockLearningContent(learningContent);

          // when
          const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
            certificationCourseId,
            userId,
            reproducibilityRate: 95,
            skillRepository,
          });

          // then
          expect(cleaCertificationScoring.isAcquired()).to.be.true;
        });
      });

      context('when user reproducibility rate is in between minimum repro rate and trusted repro rate (grey zone)', () => {

        it('should build CleaCertificationScoring containing a hash of maxReachablePixByCompetenceForClea based on operative clea skills', async () => {
          // given
          const cleaSkill1Comp1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1', pixValue: 3 });
          const cleaSkill2Comp1 = domainBuilder.buildSkill({ id: 'recSkill1_2', competenceId: 'recCompetence1', pixValue: 6 });
          const cleaSkill1Comp2 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2', pixValue: 4 });
          const cleaSkill2Comp2 = domainBuilder.buildSkill({ id: 'recSkill2_2', competenceId: 'recCompetence2', pixValue: 1 });
          const cleaSkill1Comp3 = domainBuilder.buildSkill({ id: 'recSkill3_1', competenceId: 'recCompetence3', pixValue: 2 });
          const someOtherSkill = domainBuilder.buildSkill({ id: 'recSkillOther', competenceId: 'recComptence3', pixValue: 66 });
          const learningContent = { skills: [
            { ...cleaSkill1Comp1, status: 'actif' },
            { ...cleaSkill2Comp1, status: 'actif' },
            { ...cleaSkill1Comp2, status: 'actif' },
            { ...cleaSkill2Comp2, status: 'périmé' },
            { ...cleaSkill1Comp3, status: 'actif' },
            { ...someOtherSkill, status: 'actif' },
          ] };
          await mockLearningContent(learningContent);
          databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId, skillIds: ['recSkill1_1', 'recSkill2_2'], name: 'badgePart1' });
          databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId, skillIds: ['recSkill1_2', 'recSkill2_1', 'recSkill3_1'], name: 'badgePart2' });
          await databaseBuilder.commit();

          // when
          const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
            certificationCourseId,
            userId,
            reproducibilityRate: 60,
            skillRepository,
          });

          // then
          expect(cleaCertificationScoring.maxReachablePixByCompetenceForClea).to.deep.equal({
            'recCompetence1': 9,
            'recCompetence2': 4,
            'recCompetence3': 2,
          });
        });

        it('should build CleaCertificationScoring containing a the user competence marks of clea competences only', async () => {
          // given
          const cleaSkill1Comp1 = domainBuilder.buildSkill({ id: 'recSkill1_1', competenceId: 'recCompetence1' });
          const cleaSkill1Comp2 = domainBuilder.buildSkill({ id: 'recSkill2_1', competenceId: 'recCompetence2' });
          const learningContent = { skills: [
            { ...cleaSkill1Comp1, status: 'actif' },
            { ...cleaSkill1Comp2, status: 'actif' },
          ] };
          await mockLearningContent(learningContent);
          databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId, skillIds: ['recSkill1_1', 'recSkill2_1'], name: 'badgePart1' });
          const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
          const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
          const cleaCompetenceMark1 = domainBuilder.buildCompetenceMark({
            id: 123,
            assessmentResultId,
            area_code: '1',
            competence_code: '1.1',
            competenceId: 'recCompetence1',
            level: 0,
            score: 13,
          });
          const cleaCompetenceMark2 = domainBuilder.buildCompetenceMark({
            id: 456,
            assessmentResultId,
            area_code: '2',
            competence_code: '2.1',
            competenceId: 'recCompetence2',
            level: 0,
            score: 8,
          });
          const otherCompetenceMark = domainBuilder.buildCompetenceMark({
            id: 789,
            assessmentResultId,
            area_code: '3',
            competence_code: '3.1',
            competenceId: 'recCompetence3',
            level: 0,
            score: 11,
          });
          databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark1);
          databaseBuilder.factory.buildCompetenceMark(cleaCompetenceMark2);
          databaseBuilder.factory.buildCompetenceMark(otherCompetenceMark);
          await databaseBuilder.commit();

          // when
          const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
            certificationCourseId,
            userId,
            reproducibilityRate: 60,
            skillRepository,
          });

          // then
          expect(cleaCertificationScoring.cleaCompetenceMarks).to.deep.equal([cleaCompetenceMark1, cleaCompetenceMark2]);
        });
      });
    });
  });
});
