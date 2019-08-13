import { Factory, faker, association } from 'ember-cli-mirage';

export default Factory.extend({

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  birthdate() {
    return faker.date.past(2, '2009-12-31');
  },

  organization: association(),

});
