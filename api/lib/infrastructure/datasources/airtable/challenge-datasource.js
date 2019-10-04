const airtable = require('../../airtable');
const {
  Challenge: { fromAirTableObject },
  AirtableResourceNotFound
} = require('./objects');

const _ = require('lodash');

const AIRTABLE_TABLE_NAME = 'Epreuves';
const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];

module.exports = {

  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then(fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }

        throw err;
      });
  },

  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME)
      .then((challengeDataObjects) => challengeDataObjects.map(fromAirTableObject));
  },

  findBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);

    return airtable.findRecords(AIRTABLE_TABLE_NAME)
      .then((challengeDataObjects) => {
        return challengeDataObjects
          .filter((rawChallenge) => (
            _.includes(VALIDATED_CHALLENGES, rawChallenge.fields.Statut)
            && _.some(rawChallenge.fields.Acquix, foundInSkillIds)
          ))
          .map(fromAirTableObject);
      });
  },

  findByCompetenceId(competenceId) {
    return airtable.findRecords(AIRTABLE_TABLE_NAME)
      .then((challengeDataObjects) => {
        return challengeDataObjects
          .filter((rawChallenge) => (
            _.includes(VALIDATED_CHALLENGES, rawChallenge.fields.Statut)
            && !_.isEmpty(rawChallenge.fields.Acquix)
            && _.includes(rawChallenge.fields['Compétences (via tube)'], competenceId)
          ))
          .map(fromAirTableObject);
      });
  },
};

