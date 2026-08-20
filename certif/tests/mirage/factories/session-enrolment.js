import dayjs from 'dayjs';
import { Factory } from 'miragejs';
import { CREATED } from 'pix-certif/models/session-management';

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

  certificationCenterId() {
    return 1;
  },
});
