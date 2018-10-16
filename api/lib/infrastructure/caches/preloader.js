const _ = require('lodash');
const airtable = require('../airtable');
const cache = require('./cache');

const AREA_TABLENAME = 'Domaines';
const CHALLENGE_TABLENAME = 'Epreuves';
const COMPETENCE_TABLENAME = 'Competences';
const COURSE_TABLENAME = 'Tests';
const SKILL_TABLENAME = 'Acquis';

const NO_FILTER = {};

function cacheIndividually(records, tablename) {
  return Promise.all(records.map((record) => {
    const cacheKey = `${tablename}_${record.id}`;
    return cache.set(cacheKey, record._rawJson);
  }));
}

function findSkillsByCompetence() {
  return airtable.findRecords(COMPETENCE_TABLENAME, NO_FILTER)
    .then((competences) => {
      return Promise.all(competences.map((competence) => {
        return airtable.findRecords(SKILL_TABLENAME, {
          filterByFormula: `FIND('${competence.get('Sous-domaine')}', {Compétence})`
        });
      }));
    });
}

module.exports = {

  loadAreas() {
    return airtable.findRecords(AREA_TABLENAME, NO_FILTER)
      .then((records) => cacheIndividually(records, AREA_TABLENAME));
  },

  loadChallenges() {
    return airtable.findRecords(CHALLENGE_TABLENAME, NO_FILTER)
      .then((records) => cacheIndividually(records, CHALLENGE_TABLENAME));
  },

  loadCompetences() {
    const sortBySubdomain = {
      sort: [{ field: 'Sous-domaine', direction: 'asc' }]
    };

    return airtable.findRecords(COMPETENCE_TABLENAME, NO_FILTER)
      .then(() => airtable.findRecords(COMPETENCE_TABLENAME, sortBySubdomain))
      .then((records) => cacheIndividually(records, COMPETENCE_TABLENAME));
  },

  loadCourses() {
    return airtable.findRecords(COURSE_TABLENAME, {})
      .then((records) => cacheIndividually(records, COURSE_TABLENAME));
  },

  loadSkills() {
    return findSkillsByCompetence()
      .then(_.flatten)
      .then((records) => cacheIndividually(records, SKILL_TABLENAME));
  }

};
