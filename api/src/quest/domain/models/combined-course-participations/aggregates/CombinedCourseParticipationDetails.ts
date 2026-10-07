import type { CombinedCourseStatus } from '@1024pix/pix-types';

import type { CombinedCourseRewardStatuses } from './CombinedCourseReward.js';

type CombinedCourseRewardStatus = (typeof CombinedCourseRewardStatuses)[keyof typeof CombinedCourseRewardStatuses];

export type CombinedCourseParticipationDetailsArgs = {
  id: number;
  firstName: string;
  lastName: string;
  status: CombinedCourseStatus;
  division: string | null;
  group: string | null;
  updatedAt: Date;
  createdAt: Date;
  nbModules: number;
  nbCampaigns: number;
  nbModulesCompleted: number;
  nbCampaignsCompleted: number;
  hasFormationItem: boolean;
  rewardStatus?: CombinedCourseRewardStatus | null;
};

export class CombinedCourseParticipationDetails {
  id: number;
  status: CombinedCourseStatus;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  division: string | null;
  group: string | null;
  lastName: string;
  hasFormationItem: boolean;
  nbModules: number;
  nbCampaigns: number;
  nbCampaignsCompleted: number;
  nbModulesCompleted: number;
  rewardStatus: CombinedCourseRewardStatus | null;

  constructor({
    id,
    firstName,
    lastName,
    status,
    division,
    group,
    updatedAt,
    createdAt,
    nbModules,
    nbCampaigns,
    nbModulesCompleted,
    nbCampaignsCompleted,
    hasFormationItem,
    rewardStatus = null,
  }: CombinedCourseParticipationDetailsArgs) {
    this.id = id;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.firstName = firstName;
    this.division = division;
    this.group = group;
    this.lastName = lastName;
    this.hasFormationItem = hasFormationItem;
    this.nbModules = nbModules;
    this.nbCampaigns = nbCampaigns;
    this.nbCampaignsCompleted = nbCampaignsCompleted;
    this.nbModulesCompleted = nbModulesCompleted;
    this.rewardStatus = rewardStatus;
  }
}
