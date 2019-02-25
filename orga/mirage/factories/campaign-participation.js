import { Factory, faker, association } from 'ember-cli-mirage';

export default Factory.extend({
  campaign: association(),

  user: association(),

  participantExternalId() {
    return faker.random.number();
  },

});
