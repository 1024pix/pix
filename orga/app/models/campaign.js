import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import ENV from 'pix-orga/config/environment';

const PROFILES_COLLECTION_TEXT = 'Collecte de profils';
const ASSESSMENT_TEXT = 'Évaluation';

export default class Campaign extends Model {
  @attr('string') name;
  @attr('string') code;
  @attr('string') type;
  @attr('string') title;
  @attr('boolean') isArchived;
  @attr('string') idPixLabel;
  @attr('string') customLandingPageText;
  @attr('string') tokenForCampaignResults;
  @attr('string') creatorId;
  @attr('string') creatorLastName;
  @attr('string') creatorFirstName;
  @attr('string') targetProfileId;
  @attr('string') targetProfileName;
  @attr('string') targetProfileImageUrl;
  @attr('number') participationsCount;
  @attr('number') sharedParticipationsCount;

  @belongsTo('user') creator;
  @belongsTo('organization') organization;
  @belongsTo('target-profile') targetProfile;
  @belongsTo('campaign-collective-result') campaignCollectiveResult;
  @belongsTo('campaign-analysis') campaignAnalysis;

  @hasMany('badge') badges;
  @hasMany('stage') stages;
  @hasMany('divisions') divisions;

  get hasBadges() {
    return Boolean(this.badges) && this.badges.length > 0;
  }

  get hasStages() {
    return Boolean(this.stages) && this.stages.length > 0;
  }

  get creatorFullName() {
    return `${this.creatorFirstName} ${this.creatorLastName}`;
  }

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

  async archive() {
    await this.store.adapterFor('campaign').archive(this);
    return this.store.findRecord('campaign', this.id);
  }

  async unarchive() {
    await this.store.adapterFor('campaign').unarchive(this);
    return this.store.findRecord('campaign', this.id);
  }
}
