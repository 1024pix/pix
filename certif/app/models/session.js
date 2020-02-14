import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

const { Model, attr, belongsTo, hasMany } = DS;

export const STARTED = 'started';
export const FINALIZED = 'finalized';
export const statusToDisplayName = {
  [STARTED]: 'Prête',
  [FINALIZED]: 'Finalisée',
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

  @equal('status', FINALIZED) isFinalized;

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

  finalize() {
    return this.store.adapterFor('session').finalize(this);
  }
}
