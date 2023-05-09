import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },
  lastName() {
    return faker.name.lastName();
  },
  email() {
    return faker.internet.exampleEmail().toLowerCase();
  },
  lang() {
    return 'FR';
  },
});
