import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import ENV from 'pix-certif/config/environment';
import { inject as service } from '@ember/service';

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
  isFinalized: equal('status', 'finalized'),

  urlToDownload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }),

  urlToUpload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/certification-candidates/import`;
  }),

  finalize(data) {
    return this.store.adapterFor('session').finalize(this, data);
  },

});
