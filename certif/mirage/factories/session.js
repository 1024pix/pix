import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  certificationCenter() {
    return faker.company.companyName();
  },

  createdAt() {
    return faker.date.recent();
  },

  certificationCenterId() {

  }

});
