import { faker } from '@faker-js/faker';
import { association, Factory } from 'miragejs';

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
