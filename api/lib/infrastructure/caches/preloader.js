const airtable = require('../airtable');
const cache = require('./cache');

const AREA_TABLENAME = 'Domaines';
const CHALLENGE_TABLENAME = 'Epreuves';
const COMPETENCE_TABLENAME = 'Competences';
const COURSE_TABLENAME = 'Tests';
const SKILL_TABLENAME = 'Acquis';

function cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = `${tablename}_${record.id}`;
    return cache.set(cacheKey, record._rawJson);
  }));
}

module.exports = {

  loadAreas() {
    return airtable.findRecords(AREA_TABLENAME)
      .then((records) => cacheIndividually(records, AREA_TABLENAME));
  },

  loadChallenges() {
    return airtable.findRecords(CHALLENGE_TABLENAME)
      .then((records) => cacheIndividually(records, CHALLENGE_TABLENAME));
  },

  loadCompetences() {
    return airtable.findRecords(COMPETENCE_TABLENAME)
      .then((records) => cacheIndividually(records, COMPETENCE_TABLENAME));
  },

  loadCourses() {
    return airtable.findRecords(COURSE_TABLENAME)
      .then((records) => cacheIndividually(records, COURSE_TABLENAME));
  },

  loadSkills() {
    return airtable.findRecords(SKILL_TABLENAME)
      .then((records) => cacheIndividually(records, SKILL_TABLENAME));
  }

};
