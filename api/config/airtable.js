const Airtable = require('airtable');
const airtableConfig = require('./settings').airtable;

module.exports = {

  base: new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.base)

};
