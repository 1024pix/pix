export default {
  dynamicFeatureToggleSystem: {
    description: 'Used to test the dynamic feature toggle system',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'],
  },
  isResultsSharedModalEnabled: {
    description: 'Used to enable displaying the "results shared!" modal',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'team-devcomp'],
  },
  isV3CertificationAttestationEnabled: {
    description: 'Used to enable new certification attestation for V3',
    type: 'boolean',
    defaultValue: false,
    tags: ['team-certification'],
  },
  shouldDisplayNewAnalysisPage: {
    description: 'Display the new page for campaign analysis',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'pix-orga', 'team-prescription'],
  },
  isPixAdminNewSidebarEnabled: {
    description: 'Display the new sidebar for Pix Admin',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend', 'pix-admin'],
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
};
