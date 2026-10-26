import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export const CombinedCourseItemTypes = {
  CAMPAIGN: 'campaign',
  FORMATION: 'formation',
  MODULE: 'module',
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
  @attr('string') description;
  @attr('array') objectives;
  @attr('string') level;

  @belongsTo('combined-course', { async: false, inverse: 'items' }) combinedCourse;

  get route() {
    return this.isCampaignType ? 'campaigns' : 'module';
  }

  get models() {
    if (this.isModuleType) {
      return [this.shortId, this.reference];
    }
    return [this.reference];
  }

  get iconUrl() {
    if (this.isCampaignType) return CombinedCourseAssets.CAMPAIGN_ICON;
    if (this.isFormationBloc) return CombinedCourseAssets.FORMATION_ICON;

    return this.image;
  }

  get typeForStepDisplay() {
    if (this.isFormationBloc) return CombinedCourseItemTypes.MODULE;
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

  get isCampaignType() {
    return this.type === CombinedCourseItemTypes.CAMPAIGN;
  }

  get isModuleType() {
    return this.type === CombinedCourseItemTypes.MODULE;
  }

  get isFormationBloc() {
    return this.type === CombinedCourseItemTypes.FORMATION;
  }
}
