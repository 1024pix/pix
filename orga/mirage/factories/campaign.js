import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  name() {
    return faker.company.companyName();
  },

  code() {
    return faker.address.zipCode();
  },

  createdAt() {
    return faker.date.recent();
  },

});
