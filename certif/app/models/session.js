import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-certif/config/environment';
import { inject as service } from '@ember/service';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({
  address: attr(),
  accessCode: attr(),
  date: attr(),
  description: attr(),
  examiner: attr(),
  room: attr(),
  time: attr(),

  // includes
  certificationCandidates: hasMany('certificationCandidate'),
  certificationCenter: belongsTo('certificationCenter'),

  session: service(),

  urlToDownload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/attendance-sheet?accessToken=${this.get('session.data.authenticated.access_token')}`;
  }),

  urlToUpload: computed('id', function() {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/certification-candidates/parse-from-attendance-sheet`;
  }),

});
