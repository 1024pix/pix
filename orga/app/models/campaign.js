import { service } from '@ember/service';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import ENV from 'pix-orga/config/environment';

export default class Campaign extends Model {
  @service store;

  @attr('nullable-string') name;
  @attr('string') code;
  @attr('string') type;
  @attr('nullable-string') title;
  @attr('boolean') isArchived;
  @attr('boolean') multipleSendings;
  @attr('nullable-string') externalIdLabel;
  @attr('string') externalIdType;
  @attr('nullable-text') customLandingPageText;
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
  @attr('boolean') targetProfileAreKnowledgeElementsResettable;
  @attr('boolean') isFromCombinedCourse;
  @attr() combinedCourse;
  @attr('number') participationsCount;
  @attr('number') sharedParticipationsCount;
  @attr('number') averageResult;
  @attr('number') totalStage;
  @attr('number') reachedStage;

  @belongsTo('organization', { async: true, inverse: 'campaigns' }) organization;
  @belongsTo('target-profile', { async: true, inverse: null }) targetProfile;
  @belongsTo('combined-course-blueprint', { async: true, inverse: null }) combinedCourseBlueprint;

  @belongsTo('campaign-collective-result', { async: true, inverse: null }) campaignCollectiveResult;
  @belongsTo('campaign-result-levels-per-tubes-and-competence', { async: true, inverse: null })
  campaignResultLevelsPerTubesAndCompetence;

  @hasMany('badge', { async: true, inverse: null }) badges;
  @hasMany('stage', { async: true, inverse: null }) stages;
  @hasMany('division', { async: true, inverse: null }) divisions;
  @hasMany('group', { async: true, inverse: null }) groups;

  get hasBadges() {
    return this.targetProfileThematicResultCount > 0;
  }

  get hasExternalId() {
    return Boolean(this.externalIdLabel);
  }

  get hasStages() {
    return this.targetProfileHasStage;
  }

  get ownerFullName() {
    return `${this.ownerFirstName} ${this.ownerLastName}`;
  }

  get isProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get isTypeExam() {
    return this.type === 'EXAM';
  }

  get urlToResult() {
    if (this.isTypeAssessment || this.isTypeExam) {
      return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-assessment-results`;
    }
    return `${ENV.APP.API_HOST}/api/campaigns/${this.id}/csv-profiles-collection-results`;
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

  setType(type) {
    if (['ASSESSMENT', 'EXAM'].includes(type)) {
      this.multipleSendings = false;
    }
    if (type === 'PROFILES_COLLECTION') {
      this.multipleSendings = true;
      this.title = null;
      this.targetProfileId = null;
    }
    this.type = type;
  }
}
