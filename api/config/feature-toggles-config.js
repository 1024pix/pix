export default {
  dynamicFeatureToggleSystem: {
    description: 'Used to test the dynamic feature toggle system',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'],
  },
  isAlwaysOkValidateNextChallengeEndpointEnabled: {
    description:
      "Enable the /api/admin/assessments/{id}/always-ok-validate-next-challenge' endpoint. The api musts bee restarted after modification",
    type: 'boolean',
    defaultValue: false,
    tags: ['restarted'],
  },
  isAsyncQuestRewardingCalculationEnabled: {
    type: 'boolean',
    description: 'Used to switch between synchronous and asynchronous mode for quest reward calculation',
    defaultValue: false,
    tags: ['team-prescription', 'frontend'],
  },
  isQuestEnabled: {
    type: 'boolean',
    description: 'Used to enable quests feature',
    defaultValue: true,
    tags: ['team-prescription', 'frontend'],
  },
  isAnonymizationWithDeletionEnabled: {
    type: 'boolean',
    description: 'Used to enable anonymization and deletion on prescriber context',
    defaultValue: false,
    tags: ['team-prescription', 'pix-api', 'backend'],
  },
  isNewAccountRecoveryEnabled: {
    type: 'boolean',
    description: 'Using and testing feature account recovery process',
    defaultValue: false,
    tags: ['team-acces', 'frontend'],
  },
  isV3CertificationAttestationEnabled: {
    description: 'Used to enable new certification attestation for V3',
    type: 'boolean',
    defaultValue: false,
    tags: ['team-certification'],
  },
  isSelfAccountDeletionEnabled: {
    description: 'Toggle self account deletion feature',
    type: 'boolean',
    defaultValue: true,
    tags: ['frontend', 'team-acces'],
  },
  shouldDisplayNewAnalysisPage: {
    description: 'Display the new page for campaign analysis',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'pix-orga', 'team-prescription'],
  },
  isPixAppNewLayoutEnabled: {
    description: 'Display the new layout for Pix App',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'pix-app'],
  },
  isV3CertificationPageEnabled: {
    description: 'Used to enable new certification page for V3',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'pix-app', 'team-certification'],
  },
  showExperimentalMissions: {
    type: 'boolean',
    description: 'Consider experimental missions as active',
    defaultValue: false,
    tags: ['team-junior'],
  },
};
