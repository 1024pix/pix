import { faker } from '@faker-js/faker';
import { association, Factory } from 'miragejs';

export default Factory.extend({
  email() {
    return faker.internet.exampleEmail();
  },

  organization: association(),
});
