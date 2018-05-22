const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Epreuves';

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

    const query = { filterByFormula: `OR(${listOfFilters.join(', ')})` };

    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((airtableRawObject) => airtableRawObject.map((airTableChallenge) => airTableDataObjects.Challenge.fromAirTableObject(airTableChallenge)));
  }

};

