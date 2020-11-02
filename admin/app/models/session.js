import isEmpty from 'lodash/isEmpty';
import sumBy from 'lodash/sumBy';
import some from 'lodash/some';
import trim from 'lodash/trim';

import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

function _getNumberOf(juryCertificationSummaries, booleanFct) {
  return sumBy(
    juryCertificationSummaries.toArray(),
    (juryCertificationSummary) => Number(booleanFct(juryCertificationSummary)),
  );
}

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
  @attr() address;
  @attr() room;
  @attr() examiner;
  @attr('date-only') date;
  @attr() time;
  @attr() accessCode;
  @attr() status;
  @attr() description;
  @attr() examinerGlobalComment;
  @attr() finalizedAt;
  @attr() resultsSentToPrescriberAt;
  @attr() publishedAt;

  @hasMany('jury-certification-summary') juryCertificationSummaries;
  @belongsTo('user') assignedCertificationOfficer;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED
        || this.status === IN_PROCESS
        || this.status === PROCESSED;
  }

  @computed('examinerGlobalComment')
  get hasExaminerGlobalComment() {
    return !isEmpty(trim(this.examinerGlobalComment));
  }

  @computed('juryCertificationSummaries.@each.isPublished')
  get isPublished() {
    return some(
      this.juryCertificationSummaries.toArray(),
      (juryCertificationSummary) => juryCertificationSummary.isPublished,
    );
  }

  @computed('juryCertificationSummaries.[]')
  get countExaminerComment() {
    const condition = (juryCertificationSummary) =>
      juryCertificationSummary.examinerComment ? juryCertificationSummary.examinerComment.trim().length > 0 : 0;
    return _getNumberOf(this.juryCertificationSummaries, condition);
  }

  @computed('juryCertificationSummaries.[]')
  get countNotCheckedEndScreen() {
    return _getNumberOf(this.juryCertificationSummaries, (juryCertificationSummary) =>
      !juryCertificationSummary.hasSeenEndTestScreen);
  }

  @computed('juryCertificationSummaries.@each.status')
  get countNonValidatedCertifications() {
    return _getNumberOf(this.juryCertificationSummaries, (juryCertificationSummary) =>
      juryCertificationSummary.status !== 'validated');
  }

  @computed('resultsSentToPrescriberAt', 'isFinalized')
  get areResultsToBeSentToPrescriber() {
    return Boolean(this.isFinalized && !this.resultsSentToPrescriberAt);
  }

  @computed('status')
  get displayStatus() {
    return statusToDisplayName[this.status];
  }
}
