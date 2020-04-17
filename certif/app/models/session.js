import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

const { Model, attr, belongsTo, hasMany } = DS;

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const IN_PROCESS = 'in_process';
export const PROCESSED = 'processed';
export const statusToDisplayName = {
  [CREATED]: 'Créée',
  [FINALIZED]: 'Finalisée',
  [IN_PROCESS]: 'Finalisée', // we don't want to show "En cours de traitement" status in Pix Certif
  [PROCESSED]: 'Résultats transmis par Pix',
};

export default class Session extends Model {
  @service session;
  @attr('string') address;
  @attr('string') accessCode;
  @attr('date-only') date;
  @attr('string') time;
  @attr('string') description;
  @attr('string') examiner;
  @attr('string') room;
  @attr('string') status;
  @attr('string') examinerGlobalComment;
  @belongsTo('certificationCenter') certificationCenter;
  @hasMany('certificationCandidate') certificationCandidates;
  @hasMany('certificationReport') certificationReports;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED
        || this.status === IN_PROCESS
        || this.status === PROCESSED;
  }

  @computed('certificationCandidates.@each.isLinked')
  get hasStarted() {
    return this.certificationCandidates.isAny('isLinked');
  }

  @computed('id')
  get urlToDownload() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }

  @computed('id')
  get urlToUpload() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/certification-candidates/import`;
  }

  @computed('status')
  get displayStatus() {
    return statusToDisplayName[this.status];
  }
}
