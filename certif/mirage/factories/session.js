import { Factory } from 'miragejs';
import dayjs from 'dayjs';
import { CREATED } from 'pix-certif/models/session';

export default Factory.extend({
  address() {
    return '10 Rue des révoltés';
  },

  accessCode() {
    return 'ABCDEF313';
  },

  date() {
    return dayjs('2023-05-17');
  },

  description() {
    return 'Une session somme toute normale';
  },

  examiner() {
    return 'Argus Rusard';
  },

  room() {
    return Math.random().toString(36).slice(2, 12);
  },

  time() {
    return '14:15';
  },

  status() {
    return CREATED;
  },

  examinerGlobalComment(i) {
    if (i % 2 === 0) {
      return 'Un commentaire de session somme toute normal';
    }

    return '';
  },

  certificationCenterId() {
    return 1;
  },
});
