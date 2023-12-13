import { Factory, trait } from 'miragejs';
import ENV from 'mon-pix/config/environment';

export default Factory.extend({
  title() {
    return 'Campagne des compétences incroyables';
  },

  type() {
    return 'ASSESSMENT';
  },

  code() {
    return Math.random().toString(36).slice(2, 8);
  },

  idPixLabel() {
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

  targetProfileName() {
    return 'Target Profile';
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
    afterCreate(campaign) {
      campaign.update({
        code: 'AUTOCOUR1',
        organizationId: ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        title: 'Dummy title',
        customLandingPageText: 'Dummy landing page text',
      });
    },
  }),
});
