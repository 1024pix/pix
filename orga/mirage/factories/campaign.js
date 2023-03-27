import { Factory, trait } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  name() {
    return faker.company.companyName();
  },

  code() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  createdAt() {
    return faker.date.recent();
  },

  ownerLastName() {
    return 'Adit';
  },

  ownerFirstName() {
    return 'Jack';
  },

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
});
