import _ from 'lodash';

import * as complementaryCertificationRepository from '../../../../../../../src/certification/configuration/infrastructure/repositories/complementary-certification-repository.js';
import { scoreComplementaryCertificationV2 } from '../../../../../../../src/certification/evaluation/domain/services/scoring/score-complementary-certification-v2.js';
import * as candidateRepository from '../../../../../../../src/certification/evaluation/infrastructure/repositories/candidate-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../../../../../../src/certification/evaluation/infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import * as certificationAssessmentRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/complementary-certification-course-result-repository.js';
import { AnswerStatus } from '../../../../../../../src/shared/domain/models/AnswerStatus.js';
import * as assessmentResultRepository from '../../../../../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import { expect } from '../../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../../tooling/databases.js';

describe('Certification | Evaluation | Integration | Domain | Services | Score Complementary Certification', function () {
  afterEach(async function () {
    await knex('complementary-certification-course-results').delete();
  });

  describe('when the candidate has taken a complementary certification', function () {
    describe('when it is acquired', function () {
      beforeEach(async function () {
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recChallenge1',
          competenceId: 'recCompetence0',
          skillId: 'someSkillIdForAcquired',
        });
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recChallenge2',
          competenceId: 'recCompetence0',
          skillId: 'someSkillIdForAcquired',
        });
        databaseBuilder.factory.learningContent.buildSkill({ id: 'someSkillIdForAcquired' });
        await databaseBuilder.commit();
      });

      it('should save a result', async function () {
        // given
        const assessmentId = 123;
        const complementaryCertificationScoringCriteria = {
          minimumReproducibilityRate: 80,
          minimumReproducibilityRateLowerLevel: 60.0,
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 501,
          complementaryCertificationBadgeKey: 'badge_key',
          minimumEarnedPix: 500,
        };
        const complementaryCertificationCourseId = 99;

        _buildComplementaryCertificationBadge({
          complementaryCertificationId: 101,
          complementaryCertificationBadgeId: 501,
          minimumReproducibilityRate: 80,
          minimumEarnedPix: 500,
        });
        _buildComplementaryCertificationCourse({
          certificationCourseId: 900,
          complementaryCertificationId: 101,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId: 501,
          complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          userId: 401,
          pixScore: 700,
          reproducibilityRate: 90,
          assessmentId,
        });

        const { challengeId: challengeId1 } = databaseBuilder.factory.buildCertificationChallenge({
          courseId: 900,
          isNeutralized: false,
          challengeId: 'recChallenge1',
          competenceId: 'recCompetence0',
          certifiableBadgeKey: 'badge_key',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: challengeId1,
          result: AnswerStatus.OK.status,
        });

        const { challengeId: challengeId2 } = databaseBuilder.factory.buildCertificationChallenge({
          courseId: 900,
          isNeutralized: false,
          challengeId: 'recChallenge2',
          competenceId: 'recCompetence0',
          certifiableBadgeKey: 'badge_key',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: challengeId2,
          result: AnswerStatus.OK.status,
        });

        await databaseBuilder.commit();

        // when
        await scoreComplementaryCertificationV2({
          certificationCourseId: 900,
          complementaryCertificationScoringCriteria,
          assessmentResultRepository,
          certificationAssessmentRepository,
          complementaryCertificationCourseResultRepository,
          complementaryCertificationScoringCriteriaRepository,
          certificationCourseRepository,
          candidateRepository,
          complementaryCertificationRepository,
          complementaryCertificationBadgesRepository,
        });

        // then
        const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
          .select()
          .first();

        expect(_.omit(complementaryCertificationCourseResults, ['id'])).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId: 501,
          source: 'PIX',
        });
      });

      describe('when it has been rejected for fraud', function () {
        it('should save a complementary certification not acquired', async function () {
          // given
          const complementaryCertificationCourseId = 99;
          const complementaryCertificationScoringCriteria = {
            minimumReproducibilityRate: 80,
            minimumReproducibilityRateLowerLevel: 60.0,
            complementaryCertificationCourseId: 99,
            complementaryCertificationBadgeId: 501,
            complementaryCertificationBadgeKey: 'badge_key',
            minimumEarnedPix: 500,
          };

          _buildComplementaryCertificationBadge({
            complementaryCertificationId: 101,
            complementaryCertificationBadgeId: 501,
            minimumReproducibilityRate: 80,
            minimumEarnedPix: 500,
          });
          _buildComplementaryCertificationCourse({
            certificationCourseId: 900,
            complementaryCertificationId: 101,
            complementaryCertificationCourseId,
            complementaryCertificationBadgeId: 501,
            complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
            userId: 401,
            pixScore: 700,
            reproducibilityRate: 90,
            isRejectedForFraud: true,
          });

          await databaseBuilder.commit();

          // when
          await scoreComplementaryCertificationV2({
            certificationCourseId: 900,
            complementaryCertificationScoringCriteria,
            assessmentResultRepository,
            certificationAssessmentRepository,
            complementaryCertificationCourseResultRepository,
            complementaryCertificationScoringCriteriaRepository,
            certificationCourseRepository,
            candidateRepository,
            complementaryCertificationRepository,
            complementaryCertificationBadgesRepository,
          });
          // then
          const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
            .select()
            .first();

          expect(_.omit(complementaryCertificationCourseResults, ['id', 'partnerKey'])).to.deep.equal({
            acquired: false,
            complementaryCertificationCourseId,
            complementaryCertificationBadgeId: 501,
            source: 'PIX',
          });
        });
      });
    });

    describe('when the lower level is acquired', function () {
      beforeEach(async function () {
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recCompetence0_Tube1_Skill1_Challenge1',
          competenceId: 'recCompetence0',
          skillId: 'someSkillId',
        });
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recCompetence0_Tube1_Skill2_Challenge2',
          competenceId: 'recCompetence0',
          skillId: 'someSkillId',
        });
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recCompetence0_Tube1_Skill2_Challenge3',
          competenceId: 'recCompetence0',
          skillId: 'someSkillId',
        });
        databaseBuilder.factory.learningContent.buildSkill({ id: 'someSkillId' });
        await databaseBuilder.commit();
      });

      it('should save a result', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          minimumReproducibilityRate: 80,
        });
        const complementaryCertificationCourseId = 99;
        const assessmentId = 123;

        const complementaryCertificationScoringCriteria = {
          minimumReproducibilityRate: 80,
          minimumReproducibilityRateLowerLevel: 0,
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 501,
          complementaryCertificationBadgeKey: 'badge_key',
          minimumEarnedPix: 200,
        };

        _buildComplementaryCertificationBadges({
          complementaryCertificationId: complementaryCertification.id,
          minimumEarnedPix: 500,
        });

        _buildComplementaryCertificationCourse({
          certificationCourseId: 900,
          complementaryCertificationId: complementaryCertification.id,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId: 501,
          complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
          userId: 401,
          pixScore: 450,
          reproducibilityRate: 65,
          assessmentId,
        });

        const certificationChallengeKo = databaseBuilder.factory.buildCertificationChallenge({
          courseId: 900,
          isNeutralized: false,
          challengeId: 'recCompetence0_Tube1_Skill1_Challenge1',
          competenceId: 'recCompetence0',
          certifiableBadgeKey: 'badge_key_1',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: certificationChallengeKo.challengeId,
          result: AnswerStatus.KO.status,
        });

        const { challengeId: challengeId1 } = databaseBuilder.factory.buildCertificationChallenge({
          courseId: 900,
          isNeutralized: false,
          challengeId: 'recCompetence0_Tube1_Skill2_Challenge2',
          competenceId: 'recCompetence0',
          certifiableBadgeKey: 'badge_key_1',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: challengeId1,
          result: AnswerStatus.OK.status,
        });

        const { challengeId: challengeId2 } = databaseBuilder.factory.buildCertificationChallenge({
          courseId: 900,
          isNeutralized: false,
          challengeId: 'recCompetence0_Tube1_Skill2_Challenge3',
          competenceId: 'recCompetence0',
          certifiableBadgeKey: 'badge_key_1',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: challengeId2,
          result: AnswerStatus.OK.status,
        });

        await databaseBuilder.commit();

        // when
        await scoreComplementaryCertificationV2({
          certificationCourseId: 900,
          complementaryCertificationScoringCriteria,
          assessmentResultRepository,
          certificationAssessmentRepository,
          complementaryCertificationCourseResultRepository,
          complementaryCertificationScoringCriteriaRepository,
          complementaryCertificationBadgesRepository,
          certificationCourseRepository,
          candidateRepository,
          complementaryCertificationRepository,
        });

        // then
        const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
          .select()
          .first();
        const { commentByAutoJury } = await knex('assessment-results').select().first();

        expect(commentByAutoJury).to.equal(AutoJuryCommentKeys.LOWER_LEVEL_COMPLEMENTARY_CERTIFICATION_ACQUIRED);
        expect(_.omit(complementaryCertificationCourseResults, ['id'])).to.deep.equal({
          acquired: true,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId: 401,
          source: 'PIX',
        });
      });
    });
  });
});

function _buildComplementaryCertificationCourse({
  certificationCourseId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
  complementaryCertificationCourseId,
  complementaryCertificationKey,
  userId,
  pixScore,
  reproducibilityRate,
  isRejectedForFraud = false,
  assessmentId = undefined,
}) {
  databaseBuilder.factory.buildUser({ id: userId });
  const sessionId = databaseBuilder.factory.buildSession().id;
  const { id: certificationCandidateId } = databaseBuilder.factory.buildCertificationCandidate({
    userId,
    sessionId,
    subscription: complementaryCertificationKey,
  });
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    userId,
    sessionId,
    isRejectedForFraud,
    candidateId: certificationCandidateId,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourse({
    id: complementaryCertificationCourseId,
    certificationCourseId,
    complementaryCertificationId,
    complementaryCertificationBadgeId,
    complementaryCertificationKey,
  });
  if (assessmentId) {
    databaseBuilder.factory.buildAssessment({
      id: assessmentId,
      certificationCourseId,
    });
  }
  const resultAssessmentId =
    assessmentId ??
    databaseBuilder.factory.buildAssessment({
      certificationCourseId,
    }).id;
  databaseBuilder.factory.buildAssessmentResult({
    certificationCourseId,
    pixScore,
    reproducibilityRate,
    assessmentId: resultAssessmentId,
    status: 'validated',
  });
  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId,
    complementaryCertificationId,
  });
  databaseBuilder.factory.buildCoreSubscription({
    certificationCandidateId,
  });
}

function _buildComplementaryCertificationBadge({
  complementaryCertificationBadgeId,
  complementaryCertificationId,
  minimumReproducibilityRate,
  minimumEarnedPix,
  targetProfileId,
  level,
  complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT,
}) {
  databaseBuilder.factory.buildComplementaryCertification({
    id: complementaryCertificationId,
    minimumReproducibilityRate,
    complementaryCertificationKey,
  });
  const { id: badgeId } = databaseBuilder.factory.buildBadge({
    key: 'badge_key',
    isCertifiable: true,
    targetProfileId,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: complementaryCertificationBadgeId,
    complementaryCertificationId,
    badgeId,
    minimumEarnedPix,
    level,
  });
}

function _buildComplementaryCertificationBadges({ minimumEarnedPix, complementaryCertificationId }) {
  databaseBuilder.factory.buildTargetProfile({ id: 1 });
  const { id: badgeId1 } = databaseBuilder.factory.buildBadge({
    key: 'badge_key_1',
    isCertifiable: true,
    targetProfileId: 1,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: 501,
    complementaryCertificationId: complementaryCertificationId,
    badgeId: badgeId1,
    minimumEarnedPix,
    level: 3,
  });
  const { id: badgeId2 } = databaseBuilder.factory.buildBadge({
    key: 'badge_key_2',
    isCertifiable: true,
    targetProfileId: 1,
  });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: 401,
    complementaryCertificationId: complementaryCertificationId,
    badgeId: badgeId2,
    minimumEarnedPix: 400,
    level: 2,
  });
}
