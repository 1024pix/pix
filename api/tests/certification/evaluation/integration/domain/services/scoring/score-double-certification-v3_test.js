import _ from 'lodash';

import { scoreDoubleCertificationV3 } from '../../../../../../../src/certification/evaluation/domain/services/scoring/score-double-certification-v3.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../../../../../../src/certification/evaluation/infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../../../../../src/certification/session-management/infrastructure/repositories/complementary-certification-course-result-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import * as certificationAssessmentRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCourseRepository from '../../../../../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as assessmentResultRepository from '../../../../../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import { databaseBuilder, expect, knex } from '../../../../../../test-helper.js';

describe('Certification | Evaluation | Integration | Domain | Services | Scoring Double Certification V3', function () {
  afterEach(async function () {
    await knex('complementary-certification-course-results').delete();
  });

  describe('when the candidate has taken a double certification', function () {
    describe('when it is acquired', function () {
      it('should save a result', async function () {
        // given
        const complementaryCertificationCourseId = 99;

        _buildComplementaryCertificationBadge({
          complementaryCertificationId: 101,
          complementaryCertificationBadgeId: 501,
          minimumReproducibilityRate: 80,
          minimumEarnedPix: 500,
          key: ComplementaryCertificationKeys.CLEA,
        });
        _buildComplementaryCertificationCourse({
          certificationCourseId: 900,
          complementaryCertificationId: 101,
          complementaryCertificationCourseId,
          complementaryCertificationBadgeId: 501,
          userId: 401,
          pixScore: 700,
          reproducibilityRate: 90,
        });

        await databaseBuilder.commit();

        // when
        await scoreDoubleCertificationV3({
          certificationCourseId: 900,
          assessmentResultRepository,
          certificationAssessmentRepository,
          complementaryCertificationCourseResultRepository,
          complementaryCertificationScoringCriteriaRepository,
          certificationCourseRepository,
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

          _buildComplementaryCertificationBadge({
            complementaryCertificationId: 101,
            complementaryCertificationBadgeId: 501,
            minimumReproducibilityRate: 80,
            minimumEarnedPix: 500,
            key: ComplementaryCertificationKeys.CLEA,
          });
          _buildComplementaryCertificationCourse({
            certificationCourseId: 900,
            complementaryCertificationId: 101,
            complementaryCertificationCourseId,
            complementaryCertificationBadgeId: 501,
            userId: 401,
            pixScore: 700,
            reproducibilityRate: 90,
            isRejectedForFraud: true,
          });

          await databaseBuilder.commit();

          // when
          await scoreDoubleCertificationV3({
            certificationCourseId: 900,
            assessmentResultRepository,
            certificationAssessmentRepository,
            complementaryCertificationCourseResultRepository,
            complementaryCertificationScoringCriteriaRepository,
            certificationCourseRepository,
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
  });
});

function _buildComplementaryCertificationCourse({
  certificationCourseId,
  complementaryCertificationId,
  complementaryCertificationBadgeId,
  complementaryCertificationCourseId,
  userId,
  pixScore,
  reproducibilityRate,
  isRejectedForFraud = false,
  assessmentId = undefined,
}) {
  databaseBuilder.factory.buildUser({ id: userId });
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    userId,
    isRejectedForFraud,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourse({
    id: complementaryCertificationCourseId,
    certificationCourseId,
    complementaryCertificationId,
    complementaryCertificationBadgeId,
  });
  if (assessmentId) {
    databaseBuilder.factory.buildAssessment({
      id: assessmentId,
      certificationCourseId,
    });
  }
  databaseBuilder.factory.buildAssessmentResult({
    certificationCourseId,
    pixScore,
    reproducibilityRate,
    assessmentId,
  });
}

function _buildComplementaryCertificationBadge({
  complementaryCertificationBadgeId,
  complementaryCertificationId,
  minimumReproducibilityRate,
  minimumEarnedPix,
  targetProfileId,
  level,
  key,
}) {
  databaseBuilder.factory.buildComplementaryCertification({
    id: complementaryCertificationId,
    minimumReproducibilityRate,
    key,
  });
  const { id: badgeId } = databaseBuilder.factory.buildBadge({
    key,
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
