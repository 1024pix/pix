import Model, { attr, hasMany } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const IN_PROCESS = 'in_process';
export const PROCESSED = 'processed';

export default class Session extends Model {
  @service session;
  @service featureToggles;

  @attr('string') address;
  @attr('string') accessCode;
  @attr('date-only') date;
  @attr('string') time;
  @attr('string') description;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') status;
  @attr('string') examinerGlobalComment;
  @attr('string') supervisorPassword;
  @attr('boolean') hasSupervisorAccess;
  @attr('boolean') hasSomeCleaAcquired;
  @attr('boolean') hasIncident;
  @attr('boolean') hasJoiningIssue;
  @attr() certificationCenterId;
  @hasMany('certificationReport') certificationReports;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED || this.status === IN_PROCESS || this.status === PROCESSED;
  }

  @computed('id', 'session.data.authenticated.access_token')
  get urlToDownloadAttendanceSheet() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/attendance-sheet?accessToken=${this.session.data.authenticated.access_token}`;
  }

  @computed('id', 'session.data.authenticated.access_token')
  get urlToDownloadCandidatesImportTemplate() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/candidates-import-sheet?accessToken=${this.session.data.authenticated.access_token}`;
  }

  @computed('id', 'session.data.authenticated.access_token')
  get urlToDownloadSupervisorKitPdf() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/supervisor-kit?accessToken=${this.session.data.authenticated.access_token}`;
  }

  @computed('id')
  get urlToUpload() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/certification-candidates/import`;
  }

  get urlToDownloadSessionIssueReportSheet() {
    return ENV.urlToDownloadSessionIssueReportSheet;
  }

  get completedCertificationReports() {
    return this.certificationReports.filter((certificationReport) => certificationReport.isCompleted);
  }

  get uncompletedCertificationReports() {
    return this.certificationReports.filter((certificationReport) => !certificationReport.isCompleted);
  }

  get shouldDisplayCleaResultDownloadSection() {
    return (
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled &&
      this.hasSomeCleaAcquired
    );
  }
}
