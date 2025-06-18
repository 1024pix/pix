export default {
  dynamicFeatureToggleSystem: {
    description: 'Used to test the dynamic feature toggle system',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'],
  },
  isTextToSpeechButtonEnabled: {
    type: 'boolean',
    description: 'Enable the text to speech button on challenges',
    defaultValue: true,
    tags: ['frontend'],
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
  isEmbedLLMEnabled: {
    type: 'boolean',
    description: 'Allow embeds with LLM prompts to interact with the LLM API and start a conversation',
    defaultValue: false,
    tags: ['modulix', 'team-contenu', 'llm', 'embed', 'pix-app'],
  },
  upgradeToRealUserEnabled: {
    type: 'boolean',
    description: 'Enable upgrade of anonymous accounts to true accounts after anonymous campaign participation.',
    defaultValue: false,
    tags: ['frontend', 'team-acces', 'pix-app'],
  },
};
