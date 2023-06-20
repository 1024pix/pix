import { Factory } from 'miragejs';
import dayjs from 'dayjs';

export default Factory.extend({
  firstName() {
    return 'Quentin';
  },

  lastName() {
    return 'Leboncollegue';
  },

  birthdate() {
    return dayjs('1990-01-02');
  },

  birthCity() {
    return 'Saint-Malo';
  },

  birthProvinceCode() {
    return '354';
  },

  birthCountry() {
    return 'France';
  },

  email() {
    return 'quentin.boncollegue@example.net';
  },

  externalId() {
    return '123456ABCD';
  },

  extraTimePercentage() {
    return 0.3;
  },

  isLinked() {
    return false;
  },

  sessionId() {
    return 123456;
  },

  sex() {
    return 'M';
  },

  birthInseeCode() {
    return '35288';
  },

  birthPostalCode() {
    return '35400';
  },
});
