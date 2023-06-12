import { Factory, association } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  campaign: association(),

  user: association(),

  participantExternalId() {
    return faker.number.int();
  },

  isShared() {
    return faker.datatype.boolean();
  },
});
