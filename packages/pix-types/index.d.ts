/* Campaign */

export type CampaignParticipationStatus = 'STARTED' | 'SHARED';

export type CampaignType = 'ASSESSMENT' | 'EXAM' | 'PROFILES_COLLECTION';

/* CombinedCourse */

export type CombinedCourseItemType = 'module' | 'campaign' | 'formation';

export type CombinedCourseParticipationStatus = 'STARTED' | 'COMPLETED';

export type CombinedCourseRewardStatus = 'NOT_STARTED' | 'STARTED' | 'OBTAINED' | 'NOT_OBTAINED';

export type CombinedCourseStatus = 'NOT_STARTED' | 'STARTED' | 'COMPLETED';

/* InformationBanner */

export type InformationBannerSeverity = 'error' | 'warning' | 'information';

/* LegalDocument */

export type LegalDocumentStatus = 'accepted' | 'requested' | 'not-applicable' | 'update-requested';

/* Organization */

export type OrganizationFeatureKey =
  | 'MISSIONS_MANAGEMENT'
  | 'LEARNER_IMPORT'
  | 'PLACES_MANAGEMENT'
  | 'ATTESTATIONS_MANAGEMENT'
  | 'MULTIPLE_SENDING_ASSESSMENT'
  | 'CAMPAIGN_WITHOUT_USER_PROFILE'
  | 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY'
  | 'ORALIZATION'
  | 'COVER_RATE'
  | 'SHOW_SKILLS'
  | 'IS_MANAGING_STUDENTS'
  | 'SHOW_NPS';

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'cancelled';

export type OrganizationRole = 'ADMIN' | 'MEMBER';

export type OrganizationType = 'SCO' | 'SUP' | 'PRO' | 'SCO-1D';

/* Mission */

export type MissionLearnerStatus = 'not-started' | 'started' | 'completed';

export type MissionResultStatus = 'exceeded' | 'reached' | 'partially-reached' | 'not-reached';

/* OrganizationImport */

export type OrganizationImportStatus =
  | 'UPLOADING'
  | 'UPLOADED'
  | 'UPLOAD_ERROR'
  | 'VALIDATED'
  | 'IMPORTED'
  | 'VALIDATION_ERROR'
  | 'IMPORT_ERROR';

/* OrganizationPlaces */

export type OrganizationPlacesLotStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED';
