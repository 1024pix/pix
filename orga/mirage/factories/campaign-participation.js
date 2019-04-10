import { Factory, faker, association } from 'ember-cli-mirage';

export default Factory.extend({
  campaign: association(),

  user: association(),

  campaignParticipationResult: association(),

  participantExternalId() {
    return faker.random.number();
  },

  isShared() {
    return faker.random.boolean();
  }

});
