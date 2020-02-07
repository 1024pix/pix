import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  title: DS.attr('string'),
  createdAt: DS.attr('date'),
  creator: DS.belongsTo('user'),
  idPixLabel: DS.attr('string'),
  customLandingPageText: DS.attr('string'),
  // TODO remove organizationId and work only with the relationship
  organizationId: DS.attr('number'),
  organization: DS.belongsTo('organization'),
  tokenForCampaignResults: DS.attr('string'),
  targetProfile: DS.belongsTo('target-profile'),
  campaignReport: DS.belongsTo('campaign-report'),
  campaignCollectiveResult: DS.belongsTo('campaign-collective-result'),

  url: computed('code', function() {
    const code = this.code;
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  }),

  urlToResult: computed('id', 'tokenForCampaignResults', function() {
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csvResults?accessToken=${this.tokenForCampaignResults}`;
  }),
});
