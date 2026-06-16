import { AssessmentResultFactory } from '../../../../../../../src/certification/evaluation/domain/models/factories/AssessmentResultFactory.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Factories | AssessmentResultFactory', function () {
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
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        commentByJury: 'message for jury',
        status: AssessmentResult.status.ERROR,
        pixScore: 0,
        reproducibilityRate: 0,
        competenceMarks: [],
        capacity: null,
        reachedMeshIndex: null,
        versionId: null,
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
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildStandardAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 90,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: 1.7,
        reachedMeshIndex: 4,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        status: AssessmentResult.status.VALIDATED,
        pixScore: 55,
        reproducibilityRate: 90,
        competenceMarks,
        capacity: 1.7,
        reachedMeshIndex: 4,
        versionId: 10,
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildCancelled', function () {
    it('should return a cancelled AssessmentResult', function () {
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildCancelledAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 50.25,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: 0.84,
        reachedMeshIndex: 4,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        status: AssessmentResult.status.CANCELLED,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks,
        capacity: 0.84,
        reachedMeshIndex: 4,
        versionId: 10,
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildCancelledByJuryAssessmentResult', function () {
    it('should return a cancelled by jury AssessmentResult', function () {
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildCancelledByJuryAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 50.25,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: 0.84,
        reachedMeshIndex: 4,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        status: AssessmentResult.status.CANCELLED_BY_JURY,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks,
        capacity: 0.84,
        reachedMeshIndex: 4,
        versionId: 10,
        commentForCandidate: {
          commentByAutoJury: 'CANCELLED_BY_JURY',
          context: 'candidate',
          fallbackComment: undefined,
        },
        commentForOrganization: {
          commentByAutoJury: 'CANCELLED_BY_JURY',
          context: 'organization',
          fallbackComment: undefined,
        },
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildNotTrustableAssessmentResult', function () {
    it('should return a not trustable AssessmentResult', function () {
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildNotTrustableAssessmentResult({
        pixScore: 55,
        reproducibilityRate: 50.25,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: 2.13,
        reachedMeshIndex: 4,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        status: AssessmentResult.status.CANCELLED,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks,
        capacity: 2.13,
        reachedMeshIndex: 4,
        versionId: 10,
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
        competenceMarks,
        capacity: 3.21,
        reachedMeshIndex: 4,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        status: AssessmentResult.status.REJECTED,
        pixScore: 55,
        reproducibilityRate: 50.25,
        competenceMarks,
        capacity: 3.21,
        reachedMeshIndex: 4,
        versionId: 10,
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
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        status: AssessmentResult.status.REJECTED,
        juryId: 456,
        capacity: -1.52,
        reachedMeshIndex: 0,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.REJECTED,
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        capacity: -1.52,
        reachedMeshIndex: 0,
        versionId: 10,
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

  describe('#buildRejectedDueToBelowMinimumMesh', function () {
    context('when pixScore is 0 (CORE scope)', function () {
      it('should return a rejected AssessmentResult with auto-jury comment', function () {
        // given
        const competenceMarks = [domainBuilder.buildCompetenceMark()];

        // when
        const actualAssessmentResult = AssessmentResultFactory.buildRejectedDueToBelowMinimumMesh({
          pixScore: 0,
          reproducibilityRate: 25,
          assessmentId: 123,
          juryId: 456,
          competenceMarks,
          capacity: -3.94,
          reachedMeshIndex: 0,
          versionId: 10,
        });

        // then
        const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
          status: AssessmentResult.status.REJECTED,
          pixScore: 0,
          reproducibilityRate: 25,
          assessmentId: 123,
          juryId: 456,
          competenceMarks,
          capacity: -3.94,
          reachedMeshIndex: 0,
          versionId: 10,
          commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
            commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
          }),
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
          }),
        });
        expectedAssessmentResult.id = undefined;
        expectedAssessmentResult.createdAt = undefined;
        expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
      });
    });

    context('when pixScore is null (non-CORE scope)', function () {
      it('should return a rejected AssessmentResult without auto-jury comment', function () {
        // given
        const competenceMarks = [domainBuilder.buildCompetenceMark()];

        // when
        const actualAssessmentResult = AssessmentResultFactory.buildRejectedDueToBelowMinimumMesh({
          pixScore: null,
          reproducibilityRate: 25,
          assessmentId: 123,
          juryId: 456,
          competenceMarks,
          capacity: -3.94,
          reachedMeshIndex: 0,
          versionId: 10,
        });

        // then
        expect(actualAssessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
        expect(actualAssessmentResult.pixScore).to.be.null;
        expect(actualAssessmentResult.commentForCandidate.commentByAutoJury).to.be.undefined;
        expect(actualAssessmentResult.commentForOrganization.commentByAutoJury).to.be.undefined;
      });
    });
  });

  describe('#buildRejectedNotEligibleEduAssessmentResult', function () {
    it('should return a rejected AssessmentResult with an EDU-specific auto-jury comment carrying the framework as scopeKey', function () {
      // when
      const actualAssessmentResult = AssessmentResultFactory.buildRejectedNotEligibleEduAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        capacity: -3.94,
        reachedMeshIndex: null,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.REJECTED,
        pixScore: null,
        reproducibilityRate: null,
        assessmentId: 123,
        juryId: 456,
        competenceMarks: [],
        capacity: -3.94,
        reachedMeshIndex: null,
        versionId: 10,
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_EDU_NOT_ELIGIBLE,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_EDU_NOT_ELIGIBLE,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildLackOfAnswersForTechnicalReason', function () {
    it('should return a cancelled AssessmentResult', function () {
      // given
      const competenceMarks = [domainBuilder.buildCompetenceMark()];

      // when
      const actualAssessmentResult = AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: -0.67,
        reachedMeshIndex: 1,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.CANCELLED,
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        competenceMarks,
        capacity: -0.67,
        reachedMeshIndex: 1,
        versionId: 10,
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildLackOfAnswers', function () {
    it('should return a rejected AssessmentResult', function () {
      // when
      const actualAssessmentResult = AssessmentResultFactory.buildLackOfAnswers({
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        competenceMarks: [],
        capacity: -0.67,
        reachedMeshIndex: 1,
        versionId: 10,
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        status: AssessmentResult.status.REJECTED,
        pixScore: 0,
        reproducibilityRate: 49,
        assessmentId: 123,
        juryId: 456,
        competenceMarks: [],
        capacity: -0.67,
        reachedMeshIndex: 1,
        versionId: 10,
        commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
        }),
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
        }),
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });
});
