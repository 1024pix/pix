import { action } from '@ember/object';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

export const CombinedCourseStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
};

export default class CombinedCourse extends Model {
  @attr('string') name;
  @attr('string') code;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() organizationId;
  @attr('string') status;
  @attr('string') description;
  @attr('string') illustration;

  @hasMany('combined-course-item', { async: false, inverse: 'combinedCourse' }) items;
  @belongsTo('combined-course-reward', { async: false, inverse: null }) reward;

  get nextCombinedCourseItem() {
    return this.hasMany('items')
      .value()
      .find((item) => !item.isCompleted);
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
    return (
      items.every((item) => item.type === CombinedCourseItemTypes.MODULE) ||
      items.every((item) => item.type === CombinedCourseItemTypes.CAMPAIGN)
    );
  }

  get hasItemOfTypeModule() {
    return Boolean(
      this.hasMany('items')
        ?.value()
        ?.find((item) => item.type === CombinedCourseItemTypes.MODULE),
    );
  }
}
