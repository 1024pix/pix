import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  title() {
    return faker.random.words();
  },

  type() {
    return 'ASSESSMENT';
  },

  code() {
    return faker.random.alphaNumeric(6);
  },

  idPixLabel() {
    return null;
  },

  organizationName() {
    return faker.company.companyName();
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
