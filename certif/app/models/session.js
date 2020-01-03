import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import ENV from 'pix-certif/config/environment';
import { inject as service } from '@ember/service';

const statusToDisplayName = {
  started: 'Prête',
  finalized: 'Finalisée',
};

export default DS.Model.extend({
  address: DS.attr(),
  accessCode: DS.attr(),
  date: DS.attr('date-only'),
  description: DS.attr(),
  examiner: DS.attr(),
  room: DS.attr(),
  time: DS.attr(),
  certificationCenter: DS.belongsTo('certificationCenter'),
  certificationCandidates: DS.hasMany('certificationCandidate'),
  session: service(),
  status: DS.attr(),
  examinerComment: DS.attr(),
  isFinalized: equal('status', 'finalized'),
  hasStarted: computed('certificationCandidates.@each.isLinked', function() {
    return this.certificationCandidates.isAny('isLinked');
  }),

  urlToDownload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }),

  urlToUpload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/certification-candidates/import`;
  }),

  displayStatus: computed('status', function() {
    return statusToDisplayName[this.status];
  }),

  finalize() {
    return this.store.adapterFor('session').finalize(this);
  },

});
