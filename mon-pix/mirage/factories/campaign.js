import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  name() {
    return faker.random.words();
  },

  code() {
    return faker.random.alphaNumeric(6);
  },

  idPixLabel() {
    return null;
  },

  organizationLogoUrl() {
    return 'data:jpeg;base64=somelogo';
  },

  organizationName() {
    return faker.company.companyName();
  },

  isRestricted() {
    return false;
  },

  afterCreate(campaign, server) {
    if (!campaign.targetProfile) {
      campaign.update({
        targetProfile : server.create('target-profile', { name: 'Target Profile' }),
      });
    }
    if (!campaign.type) {
      campaign.update({
        type : 'ASSESSMENT',
      });
    }
  },

  withOneChallenge: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forCampaign');
    }
  }),

  withThreeChallenges: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forCampaign');
      server.create('challenge', 'forCampaign');
      server.create('challenge', 'forCampaign');
    }
  }),

  ofTypeAssessment: trait({
    afterCreate(campaign) {
      campaign.update({
        type : 'ASSESSMENT',
      });
    }
  }),

  ofTypeProfilesCollection: trait({
    afterCreate(campaign) {
      campaign.update({
        type : 'PROFILES_COLLECTION',
      });
    }
  }),

  restricted: trait({
    afterCreate(campaign) {
      campaign.update({
        isRestricted : true,
      });
    }
  }),
});
