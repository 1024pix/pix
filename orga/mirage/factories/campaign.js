import { Factory, trait } from 'miragejs';

export default Factory.extend({
  name() {
    return 'Campagne d’évaluation 972';
  },

  code() {
    return 'ABCDEF972';
  },

  createdAt() {
    return '2023-05-17';
  },

  ownerLastName() {
    return 'Adit';
  },

  ownerFirstName() {
    return 'Jack';
  },

  type() {
    return 'PROFILES_COLLECTION';
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
