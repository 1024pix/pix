import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { Factory, trait } from 'miragejs';
import { CREATED, FINALIZED, IN_PROCESS, PROCESSED } from 'pix-admin/models/session';

export default Factory.extend({
  certificationCenterName() {
    return faker.company.name();
  },

  certificationCenterExternalId() {
    return faker.company.name();
  },

  certificationCenterType() {
    return 'SCO';
  },

  certificationCenterId() {
    return 1234;
  },

  address() {
    return faker.location.street();
  },

  room() {
    return faker.string.alphanumeric(9);
  },

  examiner() {
    return faker.company.name();
  },

  date() {
    return dayjs(faker.date.recent()).format('YYYY-MM-DD');
  },

  time() {
    return (
      faker.number.int({ min: 0, max: 23 }).toString().padStart(2, '0') +
      ':' +
      faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')
    );
  },

  status() {
    return CREATED;
  },

  accessCode() {
    return 'ABCDEF' + faker.number.int({ min: 100, max: 999 });
  },

  description() {
    return faker.lorem.words();
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return faker.lorem.words();
    }

    return '';
  },

  withResultsSentToPrescriber: trait({
    resultsSentToPrescriberAt: faker.date.past(),
  }),

  created: trait({
    status: CREATED,
  }),

  finalized: trait({
    status: FINALIZED,
    finalizedAt: faker.date.past(),
  }),

  inProcess: trait({
    status: IN_PROCESS,
    finalizedAt: faker.date.past(),
  }),

  processed: trait({
    status: PROCESSED,
    finalizedAt: faker.date.past(),
    publishedAt: faker.date.recent(),
  }),
});
