import type { CombinedCourseParticipationStatus, CombinedCourseRewardStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type NullableStringTransform from '../transforms/nullable-string';

export interface RewardStatusDisplay {
  icon: string;
  text: string;
  class: string;
}

export default class CombinedCourseParticipation extends Model {
  declare [Type]: 'combined-course-participation';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare status: CombinedCourseParticipationStatus | null;
  @attr<NullableStringTransform>('nullable-string') declare group: string | null;
  @attr<NullableStringTransform>('nullable-string') declare division: string | null;
  @attr<NumberTransform>('number') declare nbCampaigns: number | null;
  @attr<NumberTransform>('number') declare nbModules: number | null;
  @attr<NumberTransform>('number') declare nbCampaignsCompleted: number | null;
  @attr<NumberTransform>('number') declare nbModulesCompleted: number | null;
  @attr<StringTransform>('string') declare rewardStatus: CombinedCourseRewardStatus | null;

  get rewardStatusDisplay(): RewardStatusDisplay {
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
} as const satisfies Record<CombinedCourseParticipationStatus, CombinedCourseParticipationStatus>;
