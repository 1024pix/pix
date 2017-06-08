const AirtableSerializer = require('./airtable-serializer');
const Serie = require('../../../../lib/domain/models/referential/serie');

class SerieSerializer extends AirtableSerializer {

  constructor() {
    super('serie');
  }

  deserialize(airtableRecord) {
    const serie = new Serie();

    serie.id = airtableRecord.id;

    if (airtableRecord.fields) {
      serie.name = airtableRecord.fields['nom'];
      serie.courses = airtableRecord.fields['tests'];
    }

    return serie;
  }

}

module.exports = new SerieSerializer();
