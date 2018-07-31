import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  email() {
    return faker.internet.email();
  },

  cgu() {
    return faker.random.boolean();
  },

  cguOrga() {
    return faker.random.boolean();
  }

});
