const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Epreuves';
const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];

module.exports = {

  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(airTableDataObjects.Challenge.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new airTableDataObjects.AirtableResourceNotFound();
        }

        throw err;
      });
  },

  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((challengeDataObjects) => {
        return challengeDataObjects.map(airTableDataObjects.Challenge.fromAirTableObject);
      });
  },

  findBySkillNames(listOfSkillNames) {
    const listOfFilters = [];
    listOfSkillNames.forEach((skillName) => {
      listOfFilters.push(`FIND("${skillName}", ARRAYJOIN({acquis}, ";"))`);
    });
    const statutsValidated = VALIDATED_CHALLENGES.map((validatedStatut) => `{Statut}="${validatedStatut}"`);

    const query = { filterByFormula: `AND(OR(${listOfFilters.join(', ')}), OR(${statutsValidated.join(',')}))` };

    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((challengeDataObjects) => {
        return challengeDataObjects.map(airTableDataObjects.Challenge.fromAirTableObject);
      });
  },

  findByCompetence(competence) {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((challengeDataObjects) => {
        return challengeDataObjects
          .filter((challenge) => (
            _.includes(VALIDATED_CHALLENGES, challenge.fields.Statut)
            && !_.isEmpty(challenge.fields.acquis)
            && _.includes(challenge.fields.competences, competence.id)
          ))
          .map(airTableDataObjects.Challenge.fromAirTableObject);
      });
  },
};

