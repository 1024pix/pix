import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';
import { CREATED, FINALIZED, IN_PROCESS, PROCESSED } from 'pix-admin/models/session';

export default Factory.extend({

  certificationCenterName() {
    return faker.company.companyName();
  },

  certificationCenterType() {
    return 'SCO';
  },

  address() {
    return faker.address.streetName();
  },

  room() {
    return faker.random.alphaNumeric(9);
  },

  examiner() {
    return faker.company.companyName();
  },

  date() {
    return moment(faker.date.recent()).format('YYYY-MM-DD');
  },

  time() {
    return faker.random.number({ min: 0, max: 23 }).toString().padStart(2, '0') +
      ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0');
  },

  status() {
    return CREATED;
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  description() {
    return faker.random.words();
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return faker.random.words();
    }

    return '';
  },

  withResultsSentToPrescriber: trait({
    resultsSentToPrescriberAt: faker.date.past(),
  }),

  created: trait({
    status: CREATED,
  }),

  withAssignedCertificationOfficer: trait({
    afterCreate(session, server) {
      if (!session.assignedCertificationOfficer) {
        session.update({ assignedCertificationOfficer: server.create('user'), status: IN_PROCESS });
      }
    }
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
