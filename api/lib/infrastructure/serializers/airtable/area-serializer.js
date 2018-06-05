const Area = require('../../../domain/models/Area');

class AreaSerializer {

  deserialize(airtableArea) {
    return new Area({
      id: airtableArea.getId(),
      name: airtableArea.get('Nom'),
      code: airtableArea.get('Code'),
      title: airtableArea.get('Titre'),
    });
  }
}

module.exports = new AreaSerializer();
