import _ from 'lodash';

import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

function _getNumberOf(certifications, booleanFct) {
  return _.sumBy(
    certifications.toArray(),
    (certif) => Number(booleanFct(certif))
  );
}

function _formatHumanReadableLocaleDateTime(date, options) {
  return date ? (new Date(date)).toLocaleString('fr-FR', options) : date;
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

  @hasMany('certification') certifications;
  @belongsTo('user') assignedCertificationOfficer;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED
        || this.status === IN_PROCESS
        || this.status === PROCESSED;
  }

  @computed('examinerGlobalComment')
  get hasExaminerGlobalComment() {
    return !_.isEmpty(_.trim(this.examinerGlobalComment));
  }

  @computed('certifications.@each.isPublished')
  get isPublished() {
    return _.some(
      this.certifications.toArray(),
      (certif) => certif.isPublished
    );
  }

  @computed('certifications.[]')
  get countExaminerComment() {
    const condition = (certif) => certif.examinerComment ? certif.examinerComment.trim().length > 0 : 0;
    return _getNumberOf(this.certifications, condition);
  }

  @computed('certifications.[]')
  get countNotCheckedEndScreen() {
    return _getNumberOf(this.certifications, (certif) => !certif.hasSeenEndTestScreen);
  }

  @computed('certifications.@each.status')
  get countNonValidatedCertifications() {
    return _getNumberOf(this.certifications, (certif) => certif.status !== 'validated');
  }

  @computed('resultsSentToPrescriberAt')
  get displayResultsSentToPrescriberDate() {
    return _formatHumanReadableLocaleDateTime(this.resultsSentToPrescriberAt);
  }

  @computed('resultsSentToPrescriberAt', 'isFinalized')
  get areResultsToBeSentToPrescriber() {
    return Boolean(this.isFinalized && !this.resultsSentToPrescriberAt);
  }

  @computed('date')
  get displayDate() {
    return _formatHumanReadableLocaleDateTime(this.date, { day: 'numeric', month: 'numeric', year: 'numeric' });
  }

  @computed('finalizedAt')
  get displayFinalizationDate() {
    return _formatHumanReadableLocaleDateTime(this.finalizedAt);
  }

  @computed('publishedAt')
  get displayPublishedAtDate() {
    return _formatHumanReadableLocaleDateTime(this.publishedAt);
  }

  @computed('status')
  get displayStatus() {
    return statusToDisplayName[this.status];
  }
}
