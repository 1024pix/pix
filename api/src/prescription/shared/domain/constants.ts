import type { CampaignParticipationStatus, CampaignType } from '@1024pix/pix-types';

const CampaignParticipationStatuses = {
  STARTED: 'STARTED',
  SHARED: 'SHARED',
} as const satisfies Record<CampaignParticipationStatus, CampaignParticipationStatus>;

const CampaignTypes = {
  ASSESSMENT: 'ASSESSMENT',
  EXAM: 'EXAM',
  PROFILES_COLLECTION: 'PROFILES_COLLECTION',
} as const satisfies Record<CampaignType, CampaignType>;

const CampaignExternalIdTypes = {
  STRING: 'STRING',
  EMAIL: 'EMAIL',
} as const;

const CombinedCourseParticipationStatuses = {
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
} as const;

const CombinedCourseStatuses = {
  ...CombinedCourseParticipationStatuses,
  NOT_STARTED: 'NOT_STARTED',
} as const;

const MaxMasteryRate = {
  MAX_MASTERY_RATE: 1,
} as const;

export {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
  CampaignTypes,
  CombinedCourseParticipationStatuses,
  CombinedCourseStatuses,
  MaxMasteryRate,
};
