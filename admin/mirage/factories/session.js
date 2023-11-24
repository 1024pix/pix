import { Factory, trait } from 'miragejs';
import { CREATED, FINALIZED, IN_PROCESS, PROCESSED } from 'pix-admin/models/session';

export default Factory.extend({
  certificationCenterName() {
    return 'Centre des certifs';
  },

  certificationCenterExternalId() {
    return `center${Math.floor(Math.random() * 100000)}`;
  },

  certificationCenterType() {
    return 'SCO';
  },

  certificationCenterId() {
    return Math.floor(Math.random() * 100000);
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
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return new Date(+twoDaysAgo + Math.random() * (tenDaysAgo - twoDaysAgo)).toISOString().slice(0, 10);
  },

  time() {
    return `${Math.floor((Math.random() * 10000) % 24)}:${Math.floor((Math.random() * 10000) % 60)}`;
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
