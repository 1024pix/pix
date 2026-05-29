import Model, { attr } from '@ember-data/model';

export const REWARD_STATUSES = {
  OBTAINED: 'obtained',
  NOT_OBTAINED: 'not-obtained',
  IN_PROGRESS: 'in-progress',
};

export default class CombinedCourseReward extends Model {
  @attr('string') status;
  @attr('string') type;
  @attr('string') label;
  @attr('string') templateName;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() data;

  get computedStatus() {
    if (this.status === 'OBTAINED') {
      return REWARD_STATUSES.OBTAINED;
    }
    if (this.status === 'NOT_OBTAINED') {
      return REWARD_STATUSES.NOT_OBTAINED;
    }
    return REWARD_STATUSES.IN_PROGRESS;
  }

  get displayedStatus() {
    if (this.status === 'OBTAINED') {
      return 'pages.combined-courses.rewards.obtained.status';
    }
    if (this.status === 'NOT_OBTAINED') {
      return 'pages.combined-courses.rewards.not-obtained.status';
    }
    return 'pages.combined-courses.rewards.in-progress.status';
  }
}
