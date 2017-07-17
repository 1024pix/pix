const Competence = require('../../../domain/models/referential/compentence');
const AirtableSerializer = require('./airtable-serializer');

class CompetenceSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {

    const competence = new Competence();
    competence.id = airtableRecord.id;

    const fields = airtableRecord.fields;
    if(fields) {
      competence.name = fields['Titre'];
      competence.index = fields['Sous-domaine'];
      competence.areaId = fields['Domaine'];
    }

    return competence;
  }

}

module.exports = new CompetenceSerializer();
