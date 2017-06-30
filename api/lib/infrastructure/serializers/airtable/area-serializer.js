const Area = require('../../../domain/models/referential/area');
const AirtableSerializer = require('./airtable-serializer');

class AreaSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {

    const area = new Area();
    area.id = airtableRecord.id;

    if(airtableRecord.fields) {
      area.name = airtableRecord.fields['Nom'];
    }

    return area;
  }

}

module.exports = new AreaSerializer();
