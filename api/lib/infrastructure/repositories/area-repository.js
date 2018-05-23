const airtable = require('../airtable');
const Area = require('../../domain/models/Area');

function _toDomain(airtableArea) {
  return new Area({
    id : airtableArea.getId(),
    name: airtableArea.get('Nom')
  });
}

module.exports = {

  list() {
    return airtable.findRecords('Domaines', {})
      .then((areas) => areas.map(_toDomain));
  }
};
