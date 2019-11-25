const _ = require('lodash');
const airtable = require('../../airtable');
const { Challenge } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];

module.exports = {

  get(id) {
    return airtable.getRecord(Challenge.getAirtableName(), id)
      .then(Challenge.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }

        throw err;
      });
  },

  list() {
    return airtable.findRecords(Challenge.getAirtableName(), Challenge.getUsedAirtableFields())
      .then((challengeDataObjects) => challengeDataObjects.map(Challenge.fromAirTableObject));
  },

  findBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);

    return airtable.findRecords(Challenge.getAirtableName(), Challenge.getUsedAirtableFields())
      .then((challengeDataObjects) => {
        return challengeDataObjects
          .filter((rawChallenge) => (
            _.includes(VALIDATED_CHALLENGES, rawChallenge.fields.Statut)
            && _.some(rawChallenge.fields.Acquix, foundInSkillIds)
          ))
          .map(Challenge.fromAirTableObject);
      });
  },

  findByCompetenceId(competenceId) {
    return airtable.findRecords(Challenge.getAirtableName(), Challenge.getUsedAirtableFields())
      .then((challengeDataObjects) => {
        return challengeDataObjects
          .filter((rawChallenge) => (
            _.includes(VALIDATED_CHALLENGES, rawChallenge.fields.Statut)
            && !_.isEmpty(rawChallenge.fields.Acquix)
            && _.includes(rawChallenge.fields['Compétences (via tube)'], competenceId)
          ))
          .map(Challenge.fromAirTableObject);
      });
  },
};

