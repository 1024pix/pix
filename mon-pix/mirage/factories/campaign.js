import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  title() {
    return faker.lorem.words();
  },

  type() {
    return 'ASSESSMENT';
  },

  code() {
    return faker.string.alphanumeric(6);
  },

  idPixLabel() {
    return null;
  },

  organizationLogoUrl() {
    return 'data:jpeg;base64=somelogo';
  },

  organizationName() {
    return faker.company.name();
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
});
