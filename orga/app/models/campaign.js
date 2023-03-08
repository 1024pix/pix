import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import ENV from 'pix-orga/config/environment';
import { inject as service } from '@ember/service';

export default class Campaign extends Model {
  @service store;

  @attr('nullable-string') name;
  @attr('string') code;
  @attr('string') type;
  @attr('nullable-string') title;
  @attr('boolean') isArchived;
  @attr('boolean') multipleSendings;
  @attr('nullable-string') idPixLabel;
  @attr('nullable-text') customLandingPageText;
  @attr('string') tokenForCampaignResults;
  @attr('number') ownerId;
  @attr('string') ownerLastName;
  @attr('string') ownerFirstName;
  @attr('date') createdAt;
  @attr('string') targetProfileId;
  @attr('string') targetProfileDescription;
  @attr('string') targetProfileName;
  @attr('number') targetProfileTubesCount;
  @attr('number') targetProfileThematicResultCount;
  @attr('boolean') targetProfileHasStage;
  @attr('number') participationsCount;
  @attr('number') sharedParticipationsCount;
  @attr('number') averageResult;
  @attr('number') totalStage;
  @attr('number') reachedStage;

  @belongsTo('organization') organization;
  @belongsTo('target-profile') targetProfile;
  @belongsTo('campaign-collective-result') campaignCollectiveResult;
  @belongsTo('campaign-analysis') campaignAnalysis;

  @hasMany('badge') badges;
  @hasMany('stage') stages;
  @hasMany('divisions') divisions;
  @hasMany('groups') groups;

  get hasBadges() {
    return this.targetProfileThematicResultCount > 0;
  }

  get hasExternalId() {
    return Boolean(this.idPixLabel);
  }

  get hasStages() {
    return this.targetProfileHasStage;
  }

  get ownerFullName() {
    return `${this.ownerFirstName} ${this.ownerLastName}`;
  }

  get isTypeProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get urlToResult() {
    if (this.isTypeAssessment) {
      return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-assessment-results?accessToken=${this.tokenForCampaignResults}`;
    }
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-profiles-collection-results?accessToken=${this.tokenForCampaignResults}`;
  }

  get hasParticipations() {
    return this.participationsCount > 0;
  }

  get hasSharedParticipations() {
    return this.sharedParticipationsCount > 0;
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
