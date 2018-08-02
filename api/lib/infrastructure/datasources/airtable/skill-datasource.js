const airtable = require('../../airtable');
const airTableDataObjects = require('./objects');

const AIRTABLE_TABLE_NAME = 'Acquis';

module.exports = {
  get(id) {
    return airtable.getRecord(AIRTABLE_TABLE_NAME, id)
      .then((airtableRawObject) => airTableDataObjects.Skill.fromAirTableObject(airtableRawObject));
  },

  findByRecordIds(skillRecordIds) {

    const listOfAirtableFilters = skillRecordIds.map((recordId) => {
      return `FIND("${recordId}", {Record Id})`;
    });

    const query = { filterByFormula: `OR(${listOfAirtableFilters.join(', ')})` };

    return airtable.findRecords(AIRTABLE_TABLE_NAME, query)
      .then((airtableSkillsRawObjectsArray) => {
        return airtableSkillsRawObjectsArray
          .map((airTableSkill) => {
            return airTableDataObjects.Skill.fromAirTableObject(airTableSkill);
          });
      });
  }
};

