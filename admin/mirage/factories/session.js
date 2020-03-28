import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';
import moment from 'moment';
import { CREATED, FINALIZED, ONGOING } from 'pix-admin/models/session';

export default Factory.extend({

  address() {
    return faker.address.streetName();
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  certificationCenterName() {
    return faker.company.companyName();
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
    return CREATED;
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return faker.random.words();
    }

    return '';
  },

  withCertificationCenter: trait({
    afterCreate(session, server) {
      if (!session.certificationCenter) {
        session.update({ certificationCenter: server.create('certification-center') });
      }
      session.update({ certificationCenterName: session.certificationCenter.name });
    }
  }),

  withAssignedUser: trait({
    afterCreate(session, server) {
      if (!session.assignedUser) {
        session.update({ assignedUser: server.create('user'), status: ONGOING });
      }
    }
  }),

  finalized: trait({
    status: FINALIZED,
  })
});
