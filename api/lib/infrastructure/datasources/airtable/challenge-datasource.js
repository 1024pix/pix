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

function fromAirTableObject(airtableEpreuveObject) {

  let illustrationUrl;
  if (airtableEpreuveObject.get('Illustration de la consigne')) {
    illustrationUrl = airtableEpreuveObject.get('Illustration de la consigne')[0].url;
  }

  let attachments;
  if (airtableEpreuveObject.get('Pièce jointe')) {
    attachments = airtableEpreuveObject.get('Pièce jointe').map((attachment) => attachment.url).reverse();
  }

  let competenceId;
  if (airtableEpreuveObject.get('Compétences (via tube)')) {
    competenceId = airtableEpreuveObject.get('Compétences (via tube)')[0];
  }

  let timer;
  if (airtableEpreuveObject.get('Timer')) {
    timer = parseInt(airtableEpreuveObject.get('Timer'));
  }

  return new Challenge({
    id: airtableEpreuveObject.getId(),
    instruction: airtableEpreuveObject.get('Consigne'),
    proposals: airtableEpreuveObject.get('Propositions'),
    type: airtableEpreuveObject.get('Type d\'épreuve'),
    solution: airtableEpreuveObject.get('Bonnes réponses'),
    t1Status: airtableEpreuveObject.get('T1 - Espaces, casse & accents'),
    t2Status: airtableEpreuveObject.get('T2 - Ponctuation'),
    t3Status: airtableEpreuveObject.get('T3 - Distance d\'édition'),
    scoring: airtableEpreuveObject.get('Scoring'),
    status: airtableEpreuveObject.get('Statut'),
    skillIds: airtableEpreuveObject.get('Acquix'),
    skills: airtableEpreuveObject.get('acquis'),
    embedUrl: airtableEpreuveObject.get('Embed URL'),
    embedTitle: airtableEpreuveObject.get('Embed title'),
    embedHeight: airtableEpreuveObject.get('Embed height'),
    timer,
    illustrationUrl,
    attachments,
    competenceId,
    illustrationAlt: airtableEpreuveObject.get('Texte alternatif illustration'),
  });
}

module.exports = {

  tableName: TABLE_NAME,

  usedFields: USED_FIELDS,

  fromAirTableObject,

  get(id) {
    return airtable.getRecord(TABLE_NAME, id)
      .then(fromAirTableObject)
      .catch((err) => {
        if (err.error === 'NOT_FOUND') {
          throw new AirtableResourceNotFound();
        }

        throw err;
      });
  },

  list() {
    return airtable.findRecords(TABLE_NAME, USED_FIELDS)
      .then((challengeDataObjects) => challengeDataObjects.map(fromAirTableObject));
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
          .map(fromAirTableObject);
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
          .map(fromAirTableObject);
      });
  },
};

