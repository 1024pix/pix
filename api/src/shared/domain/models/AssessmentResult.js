/**
 * @typedef {import('../../../../lib/domain/models/CompetenceMark.js').CompetenceMark} CompetenceMark
 */
import { JuryComment, JuryCommentContexts } from '../../../certification/shared/domain/models/JuryComment.js';
import { Assessment } from './Assessment.js';

/**
 * @readonly
 * @enum {string}
 */
const status = Object.freeze({
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
});

/**
 * @readonly
 * @enum {string}
 */
const emitters = Object.freeze({
  PIX_ALGO: 'PIX-ALGO',
  PIX_JURY: 'Jury Pix',
});

class AssessmentResult {
  /**
   * @param {number} id
   * @param {JuryComment} commentForCandidate
   * @param {string} commentByJury
   * @param {JuryComment} commentForOrganization
   * @param {Date} createdAt
   * @param {emitters} emitter
   * @param {number} pixScore
   * @param {number} reproducibilityRate
   * @param {status} status
   * @param {Array<CompetenceMark>} competenceMarks
   * @param {number} assessmentId
   * @param {number} juryId
   */
  constructor({
    id,
    commentForCandidate,
    commentByJury,
    commentForOrganization,
    createdAt,
    emitter,
    pixScore,
    reproducibilityRate,
    status,
    competenceMarks = [],
    assessmentId,
    juryId,
  } = {}) {
    this.id = id;
    this.commentForCandidate = commentForCandidate;
    this.commentByJury = commentByJury;
    this.commentForOrganization = commentForOrganization;
    this.createdAt = createdAt;
    this.emitter = emitter;
    this.pixScore = pixScore;
    this.reproducibilityRate = reproducibilityRate;
    this.status = status;
    this.competenceMarks = competenceMarks;
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  static buildAlgoErrorResult({ error, assessmentId, juryId, emitter }) {
    return new AssessmentResult({
      emitter,
      commentByJury: error.message,
      pixScore: 0,
      reproducibilityRate: 0,
      status: status.ERROR,
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

  static buildStartedAssessmentResult({ assessmentId }) {
    return new AssessmentResult({
      assessmentId,
      status: Assessment.states.STARTED,
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

  isValidated() {
    return this.status === status.VALIDATED;
  }

  clone() {
    return new AssessmentResult({
      commentForCandidate: this.commentForCandidate?.clone(),
      commentByJury: this.commentByJury,
      commentForOrganization: this.commentForOrganization?.clone(),
      emitter: this.emitter,
      pixScore: this.pixScore,
      reproducibilityRate: this.reproducibilityRate,
      status: this.status,
      competenceMarks: this.competenceMarks,
      assessmentId: this.assessmentId,
      juryId: this.juryId,
    });
  }

  reject() {
    this.status = AssessmentResult.status.REJECTED;
  }
}

AssessmentResult.status = status;
AssessmentResult.emitters = emitters;
export { AssessmentResult, status };
