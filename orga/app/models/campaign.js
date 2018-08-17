import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  createdAt: DS.attr('date'),
  organizationId: DS.attr('number'),
  organization: DS.belongsTo('organization'),
  tokenToResult: DS.attr('string'),

  url: computed('code', function() {
    let code = this.get('code');
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  }),

  urlToResult: computed('id', 'tokenToResult', function () {
    return `${ENV.APP.API_HOST}/api/campaigns/${this.get('id')}/csvResults?accessToken=${this.get('tokenToResult')}`
  }),
});
