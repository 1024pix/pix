import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

const PROFILES_COLLECTION_TEXT = 'Récupération profils';
const TEST_GIVEN_TEXT = 'Parcours de test';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  type: DS.attr('string'),
  title: DS.attr('string'),
  createdAt: DS.attr('date'),
  creator: DS.belongsTo('user'),
  archivedAt: DS.attr('date'),
  idPixLabel: DS.attr('string'),
  customLandingPageText: DS.attr('string'),
  // TODO remove organizationId and work only with the relationship
  organizationId: DS.attr('number'),
  organization: DS.belongsTo('organization'),
  tokenForCampaignResults: DS.attr('string'),
  targetProfile: DS.belongsTo('target-profile'),
  campaignReport: DS.belongsTo('campaign-report'),
  campaignCollectiveResult: DS.belongsTo('campaign-collective-result'),

  isTypeProfilesCollection: computed.equal('type', 'PROFILES_COLLECTION'),
  isTypeTestGiven: computed.equal('type', 'TEST_GIVEN'),

  readableType: computed('isTypeProfilesCollection', function() {
    return this.isTypeProfilesCollection ? PROFILES_COLLECTION_TEXT : TEST_GIVEN_TEXT;
  }),

  url: computed('code', function() {
    const code = this.code;
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  }),

  urlToResult: computed('id', 'tokenForCampaignResults', function() {
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csvResults?accessToken=${this.tokenForCampaignResults}`;
  }),

  isArchived: computed('archivedAt', function() {
    return Boolean(this.archivedAt);
  }),

  canBeArchived: computed('campaign', function() {
    return this.isTypeTestGiven && ! this.isArchived;
  }),

  async archive() {
    await this.store.adapterFor('campaign').archive(this);
    return this.store.findRecord('campaign', this.id, { include: 'targetProfile' });
  },

  async unarchive() {
    await this.store.adapterFor('campaign').unarchive(this);
    return this.store.findRecord('campaign', this.id, { include: 'targetProfile' });
  }
});
