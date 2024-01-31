import { Assessment } from './Assessment.js';

const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
};

class AssessmentResult {
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
    return new AssessmentResult({
      emitter,
      commentForCandidate:
        'Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification' +
        ', a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous ' +
        "n'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un " +
        'score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification' +
        '(le cas échéant), en est informé.',
      commentForOrganization:
        'Un ou plusieurs problème(s) technique(s), signalés par ce(cette) candidate au surveillant' +
        'de la session de certification, a/ont affecté le bon déroulement du test de certification. Nous sommes dans ' +
        "l'incapacité de le/la certifier, sa certification est donc annulée. Cette information est à prendre en compte " +
        'et peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).',
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
      commentForCandidate: this.commentForCandidate,
      commentByJury: this.commentByJury,
      commentForOrganization: this.commentForOrganization,
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
export { AssessmentResult, status };
