const Area = require('../../../domain/models/Area');
const AirtableSerializer = require('./airtable-serializer');

class AreaSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {

    const areaAttributes = {};

    areaAttributes.id = airtableRecord.id;

    if(airtableRecord.fields) {
      areaAttributes.name = airtableRecord.fields['Nom'];
    }

    return new Area(areaAttributes);
  }

}

module.exports = new AreaSerializer();
