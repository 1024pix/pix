import Model, { attr, belongsTo } from '@ember-data/model';

export const CombinedCourseItemTypes = {
  CAMPAIGN: 'CAMPAIGN',
  FORMATION: 'FORMATION',
  MODULE: 'MODULE',
};

export const CombinedCourseAssets = {
  CAMPAIGN_ICON: 'https://assets.pix.org/combined-courses/campaign-icon.svg',
  FORMATION_ICON: 'https://assets.pix.org/combined-courses/picto_formation_vector.svg',
};
export default class CombinedCourseItem extends Model {
  @attr('string') reference;
  @attr('string') title;
  @attr('string') type;
  @attr('string') redirection;
  @attr('boolean') isCompleted;
  @attr('number') masteryRate;
  @attr('number') totalStagesCount;
  @attr('number') validatedStagesCount;
  @attr('boolean') isLocked;
  @attr('number') duration;
  @attr('string') image;
  @attr('string') shortId;
  @belongsTo('combined-course', { async: false, inverse: 'items' }) combinedCourse;

  get route() {
    return this.type === CombinedCourseItemTypes.CAMPAIGN ? 'campaigns' : 'module';
  }

  get models() {
    if (this.type === CombinedCourseItemTypes.MODULE) {
      return [this.shortId, this.reference];
    }
    return [this.reference];
  }

  get iconUrl() {
    if (this.type === CombinedCourseItemTypes.CAMPAIGN) return CombinedCourseAssets.CAMPAIGN_ICON;
    if (this.type === CombinedCourseItemTypes.FORMATION) return CombinedCourseAssets.FORMATION_ICON;

    return this.image;
  }

  get typeForStepDisplay() {
    if (this.type === CombinedCourseItemTypes.FORMATION) return CombinedCourseItemTypes.MODULE;
    return this.type;
  }

  get hasStagesStars() {
    return this.totalStagesCount > 0;
  }

  get totalStages() {
    return this.totalStagesCount - 1;
  }

  get validatedStages() {
    return this.validatedStagesCount - 1;
  }
}
