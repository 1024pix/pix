import { Factory, trait } from 'miragejs';
import dayjs from 'dayjs';
import { CREATED, FINALIZED, IN_PROCESS, PROCESSED } from 'pix-admin/models/session';

export default Factory.extend({
  certificationCenterName() {
    return 'Centre des certifs';
  },

  certificationCenterExternalId() {
    return 'center1234';
  },

  certificationCenterType() {
    return 'SCO';
  },

  certificationCenterId() {
    return 1234;
  },

  address() {
    return '26 quai de la Marne';
  },

  room() {
    return 987654321;
  },

  examiner() {
    return 'Jean-Jacques Voitou';
  },

  date() {
    return dayjs('2023-05-17');
  },

  time() {
    return '14:15';
  },

  status() {
    return CREATED;
  },

  accessCode() {
    return 'ABCDEF354';
  },

  description() {
    return 'Une description, un roman, une épopée';
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return 'Tout va pour le mieux dans le meilleur des mondes possibles';
    }

    return '';
  },

  withResultsSentToPrescriber: trait({
    resultsSentToPrescriberAt: '2023-05-28',
  }),

  created: trait({
    status: CREATED,
  }),

  finalized: trait({
    status: FINALIZED,
    finalizedAt: '2023-05-27',
  }),

  inProcess: trait({
    status: IN_PROCESS,
    finalizedAt: '2023-05-19',
  }),

  processed: trait({
    status: PROCESSED,
    finalizedAt: '2023-05-20',
    publishedAt: '2023-05-21',
  }),
});
