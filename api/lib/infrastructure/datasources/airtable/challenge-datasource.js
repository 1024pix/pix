const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Epreuves';
const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];

module.exports = {
  get(id) {
    return airtable.newGetRecord(AIRTABLE_TABLE_NAME, id)
      .then(airtableRawObject => airTableDataObjects.Challenge.fromAirTableObject(airtableRawObject));
  },

  findBySkills(listOfSkillNames) {

    const listOfFilters = [];
    listOfSkillNames.forEach((skillName) => {
      listOfFilters.push(`FIND("${skillName}", {acquis})`);
    });
    const statutsValidated = VALIDATED_CHALLENGES.map(validatedStatut => `{Statut}="${validatedStatut}"`);

    const query = { filterByFormula: `AND(OR(${listOfFilters.join(', ')}), OR(${statutsValidated.join(',')}))` };

    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((airtableRawObject) => {
        return airtableRawObject.map((airTableChallenge) => {
          return airTableDataObjects.Challenge.fromAirTableObject(airTableChallenge);
        });
      });
  }
};

