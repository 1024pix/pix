import { AssessmentResult } from '../../../../../shared/domain/models/index.js';
import { AutoJuryCommentKeys, JuryComment, JuryCommentContexts } from '../../../../shared/domain/models/JuryComment.js';

export class AssessmentResultFactory {
  static buildAlgoErrorResult({ error, assessmentId, juryId }) {
    return new AssessmentResult({
      commentByJury: error.message,
      pixScore: 0,
      reproducibilityRate: 0,
      status: AssessmentResult.status.ERROR,
      assessmentId,
      juryId,
    });
  }

  static buildCancelledAssessmentResult({ pixScore, reproducibilityRate, assessmentId, juryId }) {
    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.CANCELLED,
      assessmentId,
      juryId,
    });
  }

  static buildStandardAssessmentResult({ pixScore, reproducibilityRate, status, assessmentId, juryId }) {
    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status,
      assessmentId,
      juryId,
    });
  }

  static buildNotTrustableAssessmentResult({ pixScore, reproducibilityRate, assessmentId, juryId }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
    });

    return new AssessmentResult({
      commentForCandidate,
      commentForOrganization,
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.CANCELLED,
      assessmentId,
      juryId,
    });
  }

  static buildFraud({ pixScore, reproducibilityRate, assessmentId, juryId, competenceMarks }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.FRAUD,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.FRAUD,
    });

    return new AssessmentResult({
      commentForCandidate,
      commentForOrganization,
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.REJECTED,
      assessmentId,
      juryId,
      competenceMarks,
    });
  }

  static buildLackOfAnswers({ pixScore, reproducibilityRate, status, assessmentId, juryId, competenceMarks }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
    });

    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status,
      assessmentId,
      juryId,
      competenceMarks,
      commentForCandidate,
      commentForOrganization,
    });
  }

  static buildLackOfAnswersForTechnicalReason({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
  }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
    });

    return new AssessmentResult({
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.CANCELLED,
      assessmentId,
      juryId,
      competenceMarks,
      commentForCandidate,
      commentForOrganization,
    });
  }

  static buildInsufficientCorrectAnswers({ pixScore, reproducibilityRate, assessmentId, juryId }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
    });

    return new AssessmentResult({
      commentForCandidate,
      commentForOrganization,
      pixScore,
      reproducibilityRate,
      status: AssessmentResult.status.REJECTED,
      assessmentId,
      juryId,
    });
  }
}
