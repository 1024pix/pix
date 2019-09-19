import { Factory, association } from 'ember-cli-mirage';
import faker from 'faker';

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
