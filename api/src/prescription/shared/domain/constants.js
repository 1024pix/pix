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

const CampaignParticipationLoggerContext = {
  DELETION: 'CAMPAIGN_PARTICIPATION_DELETION',
  ANONYMIZATION: 'CAMPAIGN_PARTICIPATION_ANONYMIZATION',
};

const OrganizationLearnerLoggerContext = {
  DELETION: 'ORGANIZATION_LEARNER_DELETION',
  ANONYMIZATION: 'ORGANIZATION_LEARNER_ANONYMIZATION',
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
  CampaignParticipationLoggerContext,
  CampaignParticipationStatuses,
  CampaignTypes,
  CombinedCourseParticipationStatuses,
  CombinedCourseStatuses,
  MaxMasteryRate,
  OrganizationLearnerLoggerContext,
};
