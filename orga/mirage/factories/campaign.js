import { faker } from '@faker-js/faker';
import { Factory, trait } from 'miragejs';

export default Factory.extend({
  name() {
    return faker.company.name();
  },

  code() {
    return 'ABCDEF' + faker.number.int({ min: 100, max: 999 });
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
