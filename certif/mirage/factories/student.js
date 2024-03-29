import dayjs from 'dayjs';
import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return `Barish_${Math.floor(Math.random() * 100000)}`;
  },

  lastName() {
    return `Joel_${Math.floor(Math.random() * 100000)}`;
  },

  birthdate() {
    return dayjs('1975-10-18');
  },

  division() {
    return '3emeB';
  },
});
