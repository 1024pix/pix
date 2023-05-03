import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  name() {
    return faker.company.companyName();
  },

  type() {
    return 'SUP';
  },
});
