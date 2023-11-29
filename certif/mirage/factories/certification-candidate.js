import { Factory } from 'miragejs';

export default Factory.extend({
  firstName() {
    return `Quentin_${Math.floor(Math.random() * 100000)}`;
  },

  lastName() {
    return `Leboncollègue_${Math.floor(Math.random() * 100000)}`;
  },

  birthdate() {
    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    //generate a random birthdate between 20 and 50 years ago
    const randomTimestamp = twentyYearsAgo.getTime() + Math.random() * (fiftyYearsAgo - twentyYearsAgo);
    return new Date(randomTimestamp).toISOString().slice(0, 10);
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
