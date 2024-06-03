import { service } from '@ember/service';
import Model, { attr } from '@ember-data/model';
import ENV from 'pix-certif/config/environment';

export const CREATED = 'created';

export default class Session extends Model {
  @service session;
  @service featureToggles;
  @service intl;

  @attr('string') address;
  @attr('string') accessCode;
  @attr('date-only') date;
  @attr('string') time;
  @attr('string') description;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') status;
  @attr('string') supervisorPassword;
  @attr() certificationCenterId;
  @attr('number') version;

  get urlToDownloadAttendanceSheet() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/attendance-sheet`;
  }

  get urlToDownloadCandidatesImportTemplate() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/candidates-import-sheet`;
  }

  get urlToUpload() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/certification-candidates/import`;
  }
}
