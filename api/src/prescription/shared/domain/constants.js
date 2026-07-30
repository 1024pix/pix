const CampaignParticipationStatuses = {
  STARTED: 'STARTED',
  SHARED: 'SHARED',
};

const CampaignTypes = {
  ASSESSMENT: 'ASSESSMENT',
  EXAM: 'EXAM',
  PROFILES_COLLECTION: 'PROFILES_COLLECTION',
};

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
