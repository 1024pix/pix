import { Factory, trait } from 'miragejs';

export default Factory.extend({
  title() {
    return 'Campagne des compétences incroyables';
  },

  type() {
    return 'ASSESSMENT';
  },

  code() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  },

  externalIdLabel() {
    return null;
  },

  externaIdType() {
    return null;
  },

  organizationLogoUrl() {
    return 'data:jpeg;base64=somelogo';
  },

  organizationName() {
    return 'Ligue des congres et tanches';
  },

  isRestricted() {
    return false;
  },

  isAccessible() {
    return true;
  },

  targetProfileName() {
    return 'Target Profile';
  },

  afterCreate(campaign, server) {
    server.create('verified-code', {
      id: campaign.code,
      type: 'campaign',
      campaign,
    });
  },

  withOneChallenge: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forCampaign');
    },
  }),

  withThreeChallenges: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forCampaign');
      server.create('challenge', 'forCampaign');
      server.create('challenge', 'forCampaign');
    },
  }),

  ofTypeAssessment: trait({
    afterCreate(campaign) {
      campaign.update({
        type: 'ASSESSMENT',
      });
    },
  }),

  ofTypeProfilesCollection: trait({
    afterCreate(campaign) {
      campaign.update({
        type: 'PROFILES_COLLECTION',
      });
    },
  }),

  restricted: trait({
    afterCreate(campaign) {
      campaign.update({
        isRestricted: true,
      });
    },
  }),

  forAutonomousCourse: trait({
    afterCreate(campaign, server) {
      const verifiedCode = server.schema.verifiedCodes.find(campaign.code);
      campaign.update({
        code: 'AUTOCOUR1',
        organizationId: 999, // must be same value as in get-config
        title: 'Dummy title',
        customLandingPageText: 'Dummy landing page text',
      });
      verifiedCode.update({
        id: campaign.code,
      });
    },
  }),
});
