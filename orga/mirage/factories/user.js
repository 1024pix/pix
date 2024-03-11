import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return faker.person.firstName();
  },

  lastName() {
    return faker.person.lastName();
  },

  email() {
    return faker.internet.exampleEmail().toLowerCase();
  },

  pixOrgaTermsOfServiceAccepted() {
    return faker.datatype.boolean();
  },
});
