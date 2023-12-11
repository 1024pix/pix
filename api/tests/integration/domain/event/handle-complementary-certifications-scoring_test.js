import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import _ from 'lodash';

import { handleComplementaryCertificationsScoring } from '../../../../lib/domain/events/handle-complementary-certifications-scoring.js';
import * as assessmentResultRepository from '../../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as certificationAssessmentRepository from '../../../../lib/infrastructure/repositories/certification-assessment-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../../../lib/infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as complementaryCertificationScoringCriteriaRepository from '../../../../lib/infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { CertificationScoringCompleted } from '../../../../lib/domain/events/CertificationScoringCompleted.js';

describe('Integration | Event | Handle Complementary Certifications Scoring', function () {
  describe('#handleComplementaryCertificationsScoring', function () {
    beforeEach(async function () {
      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('complementary-certification-course-results').delete();
    });

    describe('when the candidate has not taken a complementary certification', function () {
      it('should save nothing', async function () {
        // when
        databaseBuilder.factory.buildUser({ id: 51 });
        databaseBuilder.factory.buildCertificationCourse({ id: 21, userId: 51 });
        const event = new CertificationScoringCompleted({
          certificationCourseId: 21,
          userId: 51,
          reproducibilityRate: 99,
        });

        await handleComplementaryCertificationsScoring({
          event,
          assessmentResultRepository,
          certificationAssessmentRepository,
          complementaryCertificationCourseResultRepository,
          complementaryCertificationScoringCriteriaRepository,
        });

        // then
        const complementaryCertificationCourseResults = await knex(
          'complementary-certification-course-results',
        ).select();
        expect(complementaryCertificationCourseResults).to.be.empty;
      });
    });

    describe('when the candidate has taken a complementary certification', function () {
      describe('when it is acquired', function () {
        it('should save a result', async function () {
          // when
          const complementaryCertificationCourseId = 99;

          _buildComplementaryCertificationBadge({
            complementaryCertificationId: 101,
            complementaryCertificationBadgeId: 501,
            minimumReproducibilityRate: 80,
            minimumEarnedPix: 500,
            hasComplementaryReferential: false,
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

          const event = new CertificationScoringCompleted({
            certificationCourseId: 900,
            userId: 401,
          });

          await handleComplementaryCertificationsScoring({
            event,
            assessmentResultRepository,
            certificationAssessmentRepository,
            complementaryCertificationCourseResultRepository,
            complementaryCertificationScoringCriteriaRepository,
          });
          // then
          const complementaryCertificationCourseResults = await knex('complementary-certification-course-results')
            .select()
            .first();

          expect(_.omit(complementaryCertificationCourseResults, ['id', 'partnerKey'])).to.deep.equal({
            acquired: true,
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
}) {
  databaseBuilder.factory.buildUser({ id: userId });
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    userId,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourse({
    id: complementaryCertificationCourseId,
    certificationCourseId,
    complementaryCertificationId,
    complementaryCertificationBadgeId,
  });
  databaseBuilder.factory.buildAssessmentResult({
    certificationCourseId,
    pixScore,
    reproducibilityRate,
  });
}

function _buildComplementaryCertificationBadge({
  complementaryCertificationBadgeId,
  complementaryCertificationId,
  minimumReproducibilityRate,
  minimumEarnedPix,
  hasComplementaryReferential,
}) {
  databaseBuilder.factory.buildComplementaryCertification({
    id: complementaryCertificationId,
    minimumReproducibilityRate,
    hasComplementaryReferential,
  });
  const { id: badgeId } = databaseBuilder.factory.buildBadge({ key: 'badge_key', isCertifiable: true });
  databaseBuilder.factory.buildComplementaryCertificationBadge({
    id: complementaryCertificationBadgeId,
    complementaryCertificationId,
    badgeId,
    minimumEarnedPix,
  });
}
