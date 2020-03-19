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
  },

  withOneChallenge: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forSmartPlacement');
    }
  }),

  withThreeChallenges: trait({
    afterCreate(campaign, server) {
      server.create('challenge', 'forSmartPlacement');
      server.create('challenge', 'forSmartPlacement');
      server.create('challenge', 'forSmartPlacement');
    }
  }),
});
