import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  createdAt: DS.attr('date'),
  idPix: DS.attr('string'),
  // TODO remove organizationId and work only with the relationship
  organizationId: DS.attr('number'),
  organization: DS.belongsTo('organization'),
  tokenForCampaignResults: DS.attr('string'),
  targetProfile: DS.belongsTo('target-profile'),

  url: computed('code', function() {
    let code = this.get('code');
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  }),

  urlToResult: computed('id', 'tokenForCampaignResults', function () {
    return `${ENV.APP.API_HOST}/api/campaigns/${this.get('id')}/csvResults?accessToken=${this.get('tokenForCampaignResults')}`
  }),
});
