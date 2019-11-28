const _ = require('lodash');
const airtable = require('../../airtable');
const { Challenge } = require('./objects');
const AirtableResourceNotFound = require('./AirtableResourceNotFound');

const TABLE_NAME = 'Epreuves';

const USED_FIELDS = [
  'Illustration de la consigne',
  'Pièce jointe',
  'Compétences (via tube)',
  'Timer',
  'Consigne',
  'Propositions',
  'Type d\'épreuve',
  'Bonnes réponses',
  'T1 - Espaces, casse & accents',
  'T2 - Ponctuation',
  'T3 - Distance d\'édition',
  'Scoring',
  'Statut',
  'Acquix',
  'acquis',
  'Embed URL',
  'Embed title',
  'Embed height',
  'Texte alternatif illustration',
];

const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(Challenge.fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }

        throw err;
      });
  },

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((challengeDataObjects) => challengeDataObjects.map(Challenge.fromAirTableObject));
  },

  findBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);

    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
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
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
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

