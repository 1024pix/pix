import { Factory, association } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  email() {
    return faker.internet.exampleEmail();
  },

  organization: association(),
});
