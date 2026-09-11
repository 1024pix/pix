import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export const CombinedCourseItemTypes = {
  CAMPAIGN: 'campaign',
  FORMATION: 'formation',
  MODULE: 'module',
  COMBINED_COURSE: 'combinedCourse',
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
  // POC: the activities of a nested combined course, as plain objects
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() childItems;
  @belongsTo('combined-course', { async: false, inverse: 'items' }) combinedCourse;

  // A nested course is rendered as a group listing its own activities, so each one
  // carries where it goes. Only modules take a redirection query param.
  get activities() {
    return (this.childItems ?? []).map((activity) => {
      const isModule = activity.type === CombinedCourseItemTypes.MODULE;
      return {
        ...activity,
        route: isModule ? 'module' : 'campaigns',
        models: isModule ? [activity.shortId, activity.reference] : [activity.reference],
        query: isModule ? { redirection: activity.redirection } : {},
        isPlaceholder: activity.type === CombinedCourseItemTypes.FORMATION,
      };
    });
  }

  get nextActivity() {
    return this.activities.find((activity) => !activity.isCompleted && !activity.isPlaceholder);
  }

  get completedActivitiesCount() {
    return this.activities.filter((activity) => activity.isCompleted).length;
  }

  // before its diagnosis, a child's modules are not computed yet: a placeholder stands
  // for them, so no total can be shown
  get hasReliableActivitiesCount() {
    return this.activities.length > 0 && !this.activities.some((activity) => activity.isPlaceholder);
  }

  get route() {
    if (this.type === CombinedCourseItemTypes.COMBINED_COURSE) return 'combined-courses.presentation';
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
    if (this.type === CombinedCourseItemTypes.COMBINED_COURSE) return CombinedCourseAssets.CAMPAIGN_ICON;

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
