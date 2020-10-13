import { Factory } from 'ember-cli-mirage';
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
    return moment(faker.date.past(30)).format('YYYY-MM-DD');
  },

  division() {
    return faker.random.word();
  },

});
