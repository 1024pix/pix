import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import ENV from 'pix-certif/config/environment';
import { inject as service } from '@ember/service';

const statusToDisplayName = {
  started: 'Prête',
  finalized: 'Finalisée',
};

export default Model.extend({
  address: attr(),
  accessCode: attr(),
  date: attr('date-only'),
  description: attr(),
  examiner: attr(),
  room: attr(),
  time: attr(),
  certificationCenter: belongsTo('certificationCenter'),
  certificationCandidates: hasMany('certificationCandidate'),
  session: service(),
  status: attr(),
  examinerComment: attr(),
  isFinalized: equal('status', 'finalized'),
  hasStarted: computed('certificationCandidates.@each.isLinked', function() {
    return this.certificationCandidates.isAny('isLinked');
  }),

  urlToDownload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }),

  urlToUpload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.id}/certification-candidates/import`;
  }),

  displayStatus: computed('status', function() {
    return statusToDisplayName[this.status];
  }),

  finalize() {
    return this.store.adapterFor('session').finalize(this);
  },

});
