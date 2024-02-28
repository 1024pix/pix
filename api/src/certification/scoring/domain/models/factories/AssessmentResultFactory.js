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
      fallbackComment:
        'Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification' +
        ', a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous ' +
        "n'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un " +
        'score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification' +
        '(le cas échéant), en est informé.',
    });

    const commentForOrganization = new JuryComment({
      context: JuryCommentContexts.ORGANIZATION,
      fallbackComment:
        'Un ou plusieurs problème(s) technique(s), signalés par ce(cette) candidate au surveillant' +
        'de la session de certification, a/ont affecté le bon déroulement du test de certification. Nous sommes dans ' +
        "l'incapacité de le/la certifier, sa certification est donc annulée. Cette information est à prendre en compte " +
        'et peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).',
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
}
