import { action } from '@ember/object';
import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export const CombinedCourseStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
};

export const CombinedCourseDurationTypes = {
  VERY_SHORT: 'VERY_SHORT',
  SHORT: 'SHORT',
  MEDIUM: 'MEDIUM',
  LONG: 'LONG',
  VERY_LONG: 'VERY_LONG',
};

export default class CombinedCourse extends Model {
  @attr('string') name;
  @attr('string') code;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() organizationId;
  @attr('string') status;
  @attr('string') description;
  @attr('string') illustration;
  @attr('string') surveyUrl;
  @attr('string') durationType;

  @hasMany('combined-course-item', { async: false, inverse: 'combinedCourse' }) items;
  @belongsTo('combined-course-reward', { async: false, inverse: null }) reward;

  get nextCombinedCourseItem() {
    return this.hasMany('items')
      .value()
      .find((item) => !item.isCompleted);
  }

  get previousCombinedCourseItem() {
    const currentItemIndex = this.hasMany('items')
      .value()
      .findIndex((item) => !item.isCompleted);

    if (currentItemIndex === 0) {
      return null;
    }

    return this.hasMany('items').value()[currentItemIndex - 1];
  }

  @action
  isPreviousItemDifferent(index) {
    if (index === 0) {
      return true;
    }
    const item = this.hasMany('items').value();
    if (item[index].typeForStepDisplay !== item[index - 1].typeForStepDisplay) {
      return true;
    }
  }

  get areItemsOfTheSameType() {
    const items = this.hasMany('items').value();
    return items.every((item) => item.isModuleType) || items.every((item) => item.isCampaignType);
  }

  get hasItemOfTypeModule() {
    return Boolean(
      this.hasMany('items')
        ?.value()
        ?.find((item) => item.isModuleType),
    );
  }
}
