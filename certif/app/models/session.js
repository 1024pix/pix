import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-certif/config/environment';


export default DS.Model.extend({
  address: DS.attr(),
  accessCode: DS.attr(),
  date: DS.attr(),
  description: DS.attr(),
  examiner: DS.attr(),
  room: DS.attr(),
  time: DS.attr(),
  certificationCenter: DS.belongsTo('certificationCenter'),
  tokenForCampaignResults: DS.attr('string'),

  urlToResult: computed('id', function () {
    return `${ENV.APP.API_HOST}/api/sessions/${this.get('id')}/attendance-sheet`
  }),
});
