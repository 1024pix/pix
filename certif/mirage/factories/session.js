import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { CREATED } from 'pix-certif/models/session';

export default Factory.extend({
  address() {
    return faker.location.street();
  },

  accessCode() {
    return 'ABCDEF' + faker.datatype.number({ min: 100, max: 999 });
  },

  date() {
    return dayjs(faker.date.recent()).format('YYYY-MM-DD');
  },

  description() {
    return faker.random.words();
  },

  examiner() {
    return faker.company.name();
  },

  room() {
    return faker.random.alphaNumeric(9);
  },

  time() {
    return (
      faker.datatype.number({ min: 0, max: 23 }).toString().padStart(2, '0') +
      ':' +
      faker.datatype.number({ min: 0, max: 59 }).toString().padStart(2, '0')
    );
  },

  status() {
    return CREATED;
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return faker.random.words();
    }

    return '';
  },

  certificationCenterId() {
    return 1;
  },
});
