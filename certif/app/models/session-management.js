// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { service } from '@ember/service';
import Model, { attr, hasMany } from '@ember-data/model';
import ENV from 'pix-certif/config/environment';

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const IN_PROCESS = 'in_process';
export const PROCESSED = 'processed';

export default class Session extends Model {
  @service session;
  @service featureToggles;
  @service intl;

  @attr('string') status;
  @attr('string') examinerGlobalComment;
  @attr('boolean') hasSupervisorAccess;
  @attr('boolean') hasSomeCleaAcquired;
  @attr('boolean') hasIncident;
  @attr('boolean') hasJoiningIssue;
  @attr('number') version;
  @hasMany('certificationReport', { async: true, inverse: null }) certificationReports;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED || this.status === IN_PROCESS || this.status === PROCESSED;
  }

  @computed('id')
  get urlToDownloadSupervisorKitPdf() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/supervisor-kit`;
  }

  get completedCertificationReports() {
    return this.hasMany('certificationReports')
      .value()
      .filter((certificationReport) => certificationReport.isCompleted);
  }

  get uncompletedCertificationReports() {
    return this.hasMany('certificationReports')
      .value()
      .filter((certificationReport) => !certificationReport.isCompleted);
  }

  get shouldDisplayCleaResultDownloadSection() {
    return this.hasSomeCleaAcquired;
  }
}
