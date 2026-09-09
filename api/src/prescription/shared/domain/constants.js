import { CampaignParticipationStatuses, CampaignTypes } from '@1024pix/pix-types';

const CampaignExternalIdTypes = {
  STRING: 'STRING',
  EMAIL: 'EMAIL',
};

const CombinedCourseParticipationStatuses = {
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
};

const CombinedCourseStatuses = {
  ...CombinedCourseParticipationStatuses,
  NOT_STARTED: 'NOT_STARTED',
};

const MaxMasteryRate = {
  MAX_MASTERY_RATE: 1,
};

export {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
  CampaignTypes,
  CombinedCourseParticipationStatuses,
  CombinedCourseStatuses,
  MaxMasteryRate,
};
