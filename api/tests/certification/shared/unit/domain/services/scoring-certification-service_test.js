import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import * as scoringCertificationService from '../../../../../../src/certification/shared/domain/services/scoring-certification-service.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Shared | Unit | Domain | Services | Scoring Certification Service', function () {
  context('#isLackOfAnswersForTechnicalReason', function () {
    context('when the certification stopped due to technical issue and has insufficient correct answers', function () {
      it('should return true', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 178,
          abortReason: ABORT_REASONS.TECHNICAL,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          percentageCorrectAnswers: 30,
        });

        // when
        const result = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
          certificationCourse,
          certificationAssessmentScore,
        });

        // then
        expect(result).to.be.true;
      });
    });

    context('when the certification is successful', function () {
      it('should return false', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 178,
          abortReason: null,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          percentageCorrectAnswers: 80,
        });

        // when
        const result = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
          certificationCourse,
          certificationAssessmentScore,
        });

        // then
        expect(result).to.be.false;
      });
    });
  });
});
