import { Factory, association } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  campaign: association(),

  user: association(),

  participantExternalId() {
    return faker.datatype.number();
  },

  isShared() {
    return faker.datatype.boolean();
  },
});
