import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return `Quentin_${Math.floor(Math.random() * 100000)}`;
  },

  lastName() {
    return `Leboncollègue_${Math.floor(Math.random() * 100000)}`;
  },

  birthdate() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return new Date(+twoDaysAgo + Math.random() * (tenDaysAgo - twoDaysAgo)).toISOString().slice(0, 10);
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
    return Math.random().toString(36).slice(2, 12);
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
