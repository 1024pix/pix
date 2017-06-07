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
      serie.nom = airtableRecord.fields['nom'];
      serie.tests = airtableRecord.fields['tests'];
    }

    return serie;
  }

}

module.exports = new SerieSerializer();
