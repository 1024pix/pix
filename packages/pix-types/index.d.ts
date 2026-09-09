export declare const CampaignParticipationStatuses: {
  readonly STARTED: 'STARTED';
  readonly SHARED: 'SHARED';
};

export declare const CampaignTypes: {
  readonly ASSESSMENT: 'ASSESSMENT';
  readonly EXAM: 'EXAM';
  readonly PROFILES_COLLECTION: 'PROFILES_COLLECTION';
};

export type CampaignParticipationStatus =
  (typeof CampaignParticipationStatuses)[keyof typeof CampaignParticipationStatuses];

export type CampaignType = (typeof CampaignTypes)[keyof typeof CampaignTypes];
