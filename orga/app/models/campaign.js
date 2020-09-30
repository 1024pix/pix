import DS from 'ember-data';
import ENV from 'pix-orga/config/environment';
const { Model, attr, belongsTo } = DS;

const PROFILES_COLLECTION_TEXT = 'Collecte de profils';
const ASSESSMENT_TEXT = 'Évaluation';

export default class Campaign extends Model {
  @attr('string')
  name;

  @attr('string')
  code;

  @attr('string')
  type;

  @attr('string')
  title;

  @attr('date')
  createdAt;

  @belongsTo('user')
  creator;

  @attr('date')
  archivedAt;

  @attr('string')
  idPixLabel;

  @attr('string')
  customLandingPageText;

  // TODO remove organizationId and work only with the relationship

  @attr('number')
  organizationId;

  @belongsTo('organization')
  organization;

  @attr('string')
  tokenForCampaignResults;

  @belongsTo('target-profile')
  targetProfile;

  @belongsTo('campaign-report')
  campaignReport;

  @belongsTo('campaign-collective-result')
  campaignCollectiveResult;

  @belongsTo('campaign-analysis')
  campaignAnalysis;

  get isTypeProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get readableType() {
    return this.isTypeProfilesCollection ? PROFILES_COLLECTION_TEXT : ASSESSMENT_TEXT;
  }

  get urlToResult() {
    if (this.isTypeAssessment) {
      return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-assessment-results?accessToken=${this.tokenForCampaignResults}`;
    }
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-profiles-collection-results?accessToken=${this.tokenForCampaignResults}`;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  async archive() {
    await this.store.adapterFor('campaign').archive(this);
    return this.store.findRecord('campaign', this.id, { include: 'targetProfile' });
  }

  async unarchive() {
    await this.store.adapterFor('campaign').unarchive(this);
    return this.store.findRecord('campaign', this.id, { include: 'targetProfile' });
  }
}
