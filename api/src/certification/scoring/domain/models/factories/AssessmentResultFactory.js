import { AssessmentResult } from '../../../../../shared/domain/models/AssessmentResult.js';
import { AutoJuryCommentKeys, JuryComment, JuryCommentContexts } from '../../../../shared/domain/models/JuryComment.js';

export class AssessmentResultFactory {
  static buildAlgoErrorResult({ error, assessmentId, juryId, emitter }) {
    return new AssessmentResult({
      emitter,
      commentByJury: error.message,
      pixScore: 0,
      reproducibilityRate: 0,
      status: AssessmentResult.status.ERROR,
      assessmentId,
      juryId,
    });
  }

  static buildStandardAssessmentResult({ pixScore, reproducibilityRate, status, assessmentId, juryId, emitter }) {
    return new AssessmentResult({
      emitter,
      pixScore,
      reproducibilityRate,
      status,
      assessmentId,
      juryId,
    });
  }

  static buildNotTrustableAssessmentResult({ pixScore, reproducibilityRate, status, assessmentId, juryId, emitter }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
    });

    return new AssessmentResult({
      emitter,
      commentForCandidate,
      commentForOrganization,
      pixScore,
      reproducibilityRate,
      status,
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
      emitter: AssessmentResult.emitters.PIX_ALGO_FRAUD_REJECTION,
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

  static buildLackOfAnswers({ pixScore, reproducibilityRate, status, assessmentId, juryId, emitter, competenceMarks }) {
    const commentForCandidate = new JuryComment({
      context: JuryCommentContexts.CANDIDATE,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS,
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS,
    });

    return new AssessmentResult({
      emitter,
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
}
