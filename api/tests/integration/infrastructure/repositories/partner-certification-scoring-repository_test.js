const {
  expect,
  databaseBuilder,
  domainBuilder,
  knex,
  sinon,
  mockLearningContent,
  catchErr,
} = require('../../../test-helper');
const omit = require('lodash/omit');
const partnerCertificationScoringRepository = require('../../../../lib/infrastructure/repositories/partner-certification-scoring-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const { NotEligibleCandidateError } = require('../../../../lib/domain/errors');
const { CleaCertificationScoring } = require('../../../../lib/domain/models');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Integration | Repository | Partner Certification Scoring', function () {
  const COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME = 'complementary-certification-course-results';
  const COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME = 'complementary-certification-courses';

  describe('#save', function () {
    afterEach(async function () {
      await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME).delete();
      await knex(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME).delete();
      await knex('certification-courses').delete();
      await knex('badges').delete();
    });

    it('should insert the complementary certification course results in db if it does not already exists by partnerKey', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
      }).id;
      const partnerCertificationScoring = domainBuilder.buildCleaCertificationScoring({
        complementaryCertificationCourseId,
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(true);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      ).select();
      expect(complementaryCertificationCourseResultSaved).to.have.length(1);
      const complementaryCertificationCourseResultSavedWithoutId = omit(
        complementaryCertificationCourseResultSaved[0],
        'id'
      );
      expect(complementaryCertificationCourseResultSavedWithoutId).to.deep.equal({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: true,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
    });

    it('should update the existing complementary certification course results if it exists', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 998,
        certificationCourseId,
      }).id;
      const partnerCertificationScoring = domainBuilder.buildCleaCertificationScoring({
        complementaryCertificationCourseId,
        certificationCourseId,
      });
      databaseBuilder.factory.buildBadge({ key: partnerCertificationScoring.partnerKey });

      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      await databaseBuilder.commit();
      sinon.stub(partnerCertificationScoring, 'isAcquired').returns(false);

      // when
      await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

      // then
      const complementaryCertificationCourseResultSaved = await knex(
        COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE_NAME
      )
        .select()
        .first();

      const complementaryCertificationCourseResultSavedWithoutId = omit(
        complementaryCertificationCourseResultSaved,
        'id'
      );
      expect(complementaryCertificationCourseResultSavedWithoutId).to.deep.equal({
        complementaryCertificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
        acquired: false,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
    });

    context('when there is multiple source results', function () {
      it('should update the PIX source complementary certification course result', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          name: ComplementaryCertification.PIX_PLUS_EDU_2ND_DEGRE,
        }).id;
        const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId,
          complementaryCertificationId,
        }).id;
        const badge = databaseBuilder.factory.buildBadge({
          key: Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          partnerKey: badge.key,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          partnerKey: badge.key,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: false,
        });
        await databaseBuilder.commit();

        const partnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
          complementaryCertificationCourseId,
          certifiableBadgeKey: badge.key,
          hasAcquiredPixCertification: false,
        });

        // when
        await partnerCertificationScoringRepository.save({ partnerCertificationScoring });

        // then
        const sourcePixComplementaryCertificationCourseResult = await knex('complementary-certification-course-results')
          .where({
            complementaryCertificationCourseId,
            source: ComplementaryCertificationCourseResult.sources.PIX,
          })
          .first();
        expect(sourcePixComplementaryCertificationCourseResult.acquired).to.be.false;
      });
    });
  });

  describe('#getCleaCertificationScoring', function () {
    context('when the user does not have no cleA badge', function () {
      it('should get a CleaCertificationScoring that throws a NotEligibleCandidateError', async function () {
        // given
        const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
        const learningContent = { skills: [skill] };
        mockLearningContent(learningContent);
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 998,
          certificationCourseId,
        }).id;
        const cleaCertificationScoring = await partnerCertificationScoringRepository.getCleaCertificationScoring({
          complementaryCertificationCourseId,
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

    context('when the user has a cleA badge', function () {
      context('when the badge was obtained after the certification test was taken', function () {
        it('should get a CleaCertificationScoring that throws a NotEligibleCandidateError', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            createdAt: new Date('2020-01-01'),
          }).id;
          const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 998,
            certificationCourseId,
          }).id;
          const badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA_V3 }).id;
          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId, createdAt: new Date('2021-06-06') });
          await databaseBuilder.commit();
          const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
          const learningContent = { skills: [skill] };
          mockLearningContent(learningContent);
          const cleaCertificationScoring = await partnerCertificationScoringRepository.getCleaCertificationScoring({
            complementaryCertificationCourseId,
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

      context('when the badge was obtained before the certification test was taken', function () {
        let userId;
        let badgeId;
        let certificationCourseId;
        let complementaryCertificationCourseId;

        beforeEach(function () {
          userId = databaseBuilder.factory.buildUser().id;
          certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            createdAt: new Date('2021-04-04'),
          }).id;
          complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 998,
            certificationCourseId,
          }).id;
          badgeId = databaseBuilder.factory.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA_V1 }).id;
          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId, createdAt: new Date('2000-01-01') });
          return databaseBuilder.commit();
        });

        it('should get an acquired CleaCertificationScoring', async function () {
          // given
          const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
          const learningContent = { skills: [skill] };
          const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
          databaseBuilder.factory.buildAssessmentResult({
            assessmentId,
            pixScore: 42,
            createdAt: new Date('2020-01-31'),
          });
          databaseBuilder.factory.buildAssessmentResult({
            assessmentId,
            pixScore: 89,
            createdAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildComplementaryCertification({
            key: ComplementaryCertification.CLEA,
            minimumReproducibilityRate: 66.5,
            minimumEarnedPix: 33,
          });
          await databaseBuilder.commit();
          mockLearningContent(learningContent);
          const expectedCleaCertificationScoring = new CleaCertificationScoring({
            complementaryCertificationCourseId: 998,
            hasAcquiredBadge: true,
            reproducibilityRate: 95,
            isBadgeAcquisitionStillValid: true,
            cleaBadgeKey: 'PIX_EMPLOI_CLEA',
            pixScore: 42,
            minimumReproducibilityRate: 66.5,
            minimumEarnedPix: 33,
          });

          // when
          const cleaCertificationScoring = await partnerCertificationScoringRepository.getCleaCertificationScoring({
            complementaryCertificationCourseId,
            certificationCourseId,
            userId,
            reproducibilityRate: 95,
            skillRepository,
          });

          // then
          expect(cleaCertificationScoring).to.deepEqualInstance(expectedCleaCertificationScoring);
        });
      });
    });
  });
});
