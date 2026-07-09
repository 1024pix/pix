import Model, { attr } from '@ember-data/model';

export default class CombinedCourseParticipation extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') status;
  @attr('nullable-string') group;
  @attr('nullable-string') division;
  @attr('number') nbCampaigns;
  @attr('number') nbModules;
  @attr('number') nbCampaignsCompleted;
  @attr('number') nbModulesCompleted;
  @attr('string') rewardStatus;

  get rewardStatusDisplay() {
    if (this.rewardStatus === 'OBTAINED') {
      return {
        icon: 'checkCircle',
        text: 'pages.combined-course.table.rewards.obtained',
        class: 'reward reward--obtained',
      };
    }
    if (this.rewardStatus === 'NOT_OBTAINED') {
      return {
        icon: 'cancel',
        text: 'pages.combined-course.table.rewards.not-obtained',
        class: 'reward reward--not-obtained',
      };
    }
    return {
      icon: 'acute',
      text: 'pages.combined-course.table.rewards.in-progress',
      class: 'reward reward--in-progress',
    };
  }
}

export const COMBINED_COURSE_PARTICIPATION_STATUSES = {
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
};
