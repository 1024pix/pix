import { CombinedCourseStatuses } from '../../../../../prescription/shared/domain/constants.js';

export const CombinedCourseRewardStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  OBTAINED: 'OBTAINED',
  NOT_OBTAINED: 'NOT_OBTAINED',
};

export class CombinedCourseReward {
  constructor({ combinedCourseDetails, reward }) {
    this.id = reward.id;
    this.type = combinedCourseDetails.quest.rewardType;
    this.data = reward;
    this.status = this.#computeStatus({ combinedCourseDetails });
    this.label = reward.label;
    this.templateName = reward.templateName;
    this.requirementsDescription = reward.requirementsDescription;
  }

  #computeStatus({ combinedCourseDetails }) {
    if (this.data.obtainedAt) {
      return CombinedCourseRewardStatuses.OBTAINED;
    }
    if (combinedCourseDetails.status === CombinedCourseStatuses.NOT_STARTED) {
      return CombinedCourseRewardStatuses.NOT_STARTED;
    }
    if (combinedCourseDetails.status === CombinedCourseStatuses.STARTED) {
      return CombinedCourseRewardStatuses.STARTED;
    }
    if (combinedCourseDetails.status === CombinedCourseStatuses.COMPLETED) {
      return CombinedCourseRewardStatuses.NOT_OBTAINED;
    }
  }
}
