import { Factory, association } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  campaign: association(),

  user: association(),

  participantExternalId() {
    return faker.random.number();
  },

  isShared() {
    return faker.random.boolean();
  },
});
