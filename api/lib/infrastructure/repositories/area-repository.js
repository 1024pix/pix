const airtable = require('../airtable');
const areaSerializer = require('../../infrastructure/serializers/airtable/area-serializer');

module.exports = {

  list() {
    return airtable.findRecords('Domaines', {})
      .then(airtableAreas => airtableAreas.map(areaSerializer.deserialize));
  }
};
