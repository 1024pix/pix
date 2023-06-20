import { Factory } from 'miragejs';
import dayjs from 'dayjs';

export default Factory.extend({
  firstName() {
    return 'Barish';
  },

  lastName() {
    return 'Joel';
  },

  birthdate() {
    return dayjs('1975-10-18');
  },

  division() {
    return '3emeB';
  },
});
