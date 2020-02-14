import { Factory, association } from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';
import { STARTED } from 'pix-certif/models/session';

export default Factory.extend({

  address() {
    return faker.address.streetName();
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  date() {
    return moment(faker.date.recent()).format('YYYY-MM-DD');
  },

  description() {
    return faker.random.words();
  },

  examiner() {
    return faker.company.companyName();
  },

  room() {
    return faker.random.alphaNumeric(9);
  },

  time() {
    return faker.random.number({ min: 0, max: 23 }).toString().padStart(2, '0') +
    ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0');
  },

  status() {
    return STARTED;
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return faker.random.words();
    }

    return '';
  },

  certificationCenter: association(),
});
