import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-certif/config/environment';
import { inject as service } from '@ember/service';

export default DS.Model.extend({
  address: DS.attr(),
  accessCode: DS.attr(),
  date: DS.attr(),
  description: DS.attr(),
  examiner: DS.attr(),
  room: DS.attr(),
  time: DS.attr(),
  certificationCenter: DS.belongsTo('certificationCenter'),
  certificationCandidates: DS.hasMany('certificationCandidate'),
  session: service(),

  urlToDownload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }),

  urlToUpload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/certification-candidates/import`;
  }),

});
