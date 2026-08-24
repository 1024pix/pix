import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import isEmpty from 'lodash/isEmpty';

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const IN_PROCESS = 'in_process';
export const PROCESSED = 'processed';
export const statusToDisplayName = {
  [CREATED]: 'Créée',
  [FINALIZED]: 'Finalisée',
  [IN_PROCESS]: 'En cours de traitement',
  [PROCESSED]: 'Résultats transmis par Pix',
};

export default class Session extends Model {
  @attr() certificationCenterType;
  @attr() certificationCenterName;
  @attr() certificationCenterId;
  @attr() certificationCenterExternalId;
  @attr() address;
  @attr() room;
  @attr() examiner;
  @attr('date-only') date;
  @attr() time;
  @attr() accessCode;
  @attr() status;
  @attr() description;
  @attr() examinerGlobalComment;
  @attr() createdAt;
  @attr() finalizedAt;
  @attr() resultsSentToPrescriberAt;
  @attr() publishedAt;
  @attr() juryComment;
  @attr() juryCommentedAt;
  @attr() numberOfStartedCertifications;
  @attr() numberOfScoringErrors;
  @attr() totalNumberOfIssueReports;
  @attr() numberOfImpactfullIssueReports;
  @attr('boolean') hasIncident;
  @attr('boolean') hasJoiningIssue;
  @attr() version;

  @hasMany('jury-certification-summary', { async: true, inverse: null }) juryCertificationSummaries;
  @belongsTo('user', { async: true, inverse: null }) assignedCertificationOfficer;
  @belongsTo('user', { async: true, inverse: null }) juryCommentAuthor;

  get isFinalized() {
    return this.status === FINALIZED || this.status === IN_PROCESS || this.status === PROCESSED;
  }

  get hasExaminerGlobalComment() {
    return !isEmpty(this.examinerGlobalComment?.trim() ?? '');
  }

  get hasComplementaryInfo() {
    return Boolean(this.hasIncident || this.hasJoiningIssue);
  }

  get isPublished() {
    return this.publishedAt !== null;
  }

  get displayStatus() {
    return statusToDisplayName[this.status];
  }
}
