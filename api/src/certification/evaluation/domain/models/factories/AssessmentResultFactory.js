import { AssessmentResult } from '../../../../../shared/domain/models/AssessmentResult.js';
import { AutoJuryCommentKeys, JuryComment, JuryCommentContexts } from '../../../../shared/domain/models/JuryComment.js';

export class AssessmentResultFactory {
  static #buildWithAutoJuryComment({
    autoJuryCommentKey,
    status,
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: autoJuryCommentKey,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: autoJuryCommentKey,
    });

    return new AssessmentResult({
      commentForCandidate,
      commentForOrganization,
      pixScore,
      reproducibilityRate,
      status,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildAlgoErrorResult({ error, assessmentId, juryId }) {
    return new AssessmentResult({
      commentByJury: error.message,
      pixScore: 0,
      reproducibilityRate: 0,
      status: AssessmentResult.status.ERROR,
      assessmentId,
      juryId,
      competenceMarks: [],
    });
  }

  static buildCancelledAssessmentResult({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.CANCELLED,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildStandardAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildNotTrustableAssessmentResult({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
      status: AssessmentResult.status.CANCELLED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildCancelledByJuryAssessmentResult({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.CANCELLED_BY_JURY,
      status: AssessmentResult.status.CANCELLED_BY_JURY,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildFraud({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.FRAUD,
      status: AssessmentResult.status.REJECTED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildLackOfAnswers({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
      status: AssessmentResult.status.REJECTED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildLackOfAnswersForTechnicalReason({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
      status: AssessmentResult.status.CANCELLED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildInsufficientCorrectAnswers({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
      status: AssessmentResult.status.REJECTED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildRejectedNotEligibleEduAssessmentResult({ assessmentId, juryId, capacity, reachedMeshIndex, versionId }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: AutoJuryCommentKeys.REJECTED_EDU_NOT_ELIGIBLE,
      status: AssessmentResult.status.REJECTED,
      pixScore: null,
      reproducibilityRate: null,
      assessmentId,
      juryId,
      competenceMarks: [],
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  static buildRejectedDueToBelowMinimumMesh({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  }) {
    return this.#buildWithAutoJuryComment({
      autoJuryCommentKey: pixScore === 0 ? AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE : null,
      status: AssessmentResult.status.REJECTED,
      pixScore,
      reproducibilityRate,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }
}
