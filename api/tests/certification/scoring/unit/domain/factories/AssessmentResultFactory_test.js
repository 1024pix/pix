import { AssessmentResultFactory } from '../../../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult, CertificationResult } from '../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Scoring | Unit | Domain | Factories | AssessmentResultFactory', function () {
  describe('#buildAlgoErrorResult', function () {
    it('should return an algo error AssessmentResult', function () {
      // given
      const error = {
        message: 'message for jury',
      };

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
        error,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        commentByJury: 'message for jury',
        status: AssessmentResult.status.ERROR,
        pixScore: 0,
        reproducibilityRate: 0,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildStandardAssessmentResult', function () {
    it('should return a standard AssessmentResult', function () {
      // when
      const actualAssessmentResult = AssessmentResultFactory.buildStandardAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 90,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        status: AssessmentResult.status.VALIDATED,
        pixScore: 55,
        reproducibilityRate: 90,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildNotTrustableAssessmentResult', function () {
    it('should return a not trustable AssessmentResult', function () {
      // when
      const actualAssessmentResult = AssessmentResultFactory.buildNotTrustableAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 50.25,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        status: AssessmentResult.status.VALIDATED,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks: [],
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildFraud', function () {
    it('should return a fraud AssessmentResult', function () {
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildFraud({
        pixScore: 55,
        reproducibilityRate: 50.25,
        assessmentId: 123,
        juryId: 456,
        emitter: 'PIX-ALGO-FRAUD-REJECTION',
        competenceMarks,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'PIX-ALGO-FRAUD-REJECTION',
        status: AssessmentResult.status.REJECTED,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks,
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildInsufficientCorrectAnswers', function () {
    it('should return an insufficient correct answers AssessmentResult', function () {
      // when
      const actualAssessmentResult = AssessmentResultFactory.buildInsufficientCorrectAnswers({
        emitter: CertificationResult.emitters.PIX_ALGO,
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        status: AssessmentResult.status.REJECTED,
        juryId: 456,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.REJECTED,
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        emitter: 'PIX-ALGO',
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });
});
