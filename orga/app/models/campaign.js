import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
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

  @equal('type', 'PROFILES_COLLECTION')
  isTypeProfilesCollection;

  @equal('type', 'ASSESSMENT')
  isTypeAssessment;

  @computed('isTypeProfilesCollection')
  get readableType() {
    return this.isTypeProfilesCollection ? PROFILES_COLLECTION_TEXT : ASSESSMENT_TEXT;
  }

  @computed('code')
  get url() {
    const code = this.code;
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  }

  @computed('id', 'tokenForCampaignResults')
  get urlToResult() {
    if (this.isTypeAssessment) {
      return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-assessment-results?accessToken=${this.tokenForCampaignResults}`;
    }
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-profiles-collection-results?accessToken=${this.tokenForCampaignResults}`;
  }

  @computed('archivedAt')
  get isArchived() {
    return Boolean(this.archivedAt);
  }

  @computed('isTypeAssessment', 'isArchived')
  get canBeArchived() {
    return this.isTypeAssessment && ! this.isArchived;
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
