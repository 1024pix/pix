import { Factory, association } from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';

export default Factory.extend({

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  birthdate() {
    return moment(faker.date.past(2, '2009-12-31')).format('YYYY-MM-DD');
  },

  organization: association(),

});
