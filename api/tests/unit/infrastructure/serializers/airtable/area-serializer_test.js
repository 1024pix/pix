const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/area-serializer');
const Area = require('../../../../../lib/domain/models/Area');
const AirtableRecord = require('airtable').Record;

describe('Unit | Serializer | area-serializer', function() {

  describe('#deserialize', () => {

    it('should return a new Area Model object', () => {
      // given
      const airtableArea = new AirtableRecord('Domaines', 'rec_area_id', {
        fields: {
          'Nom': '1. Information et données',
          'Code': '1',
          'Titre': 'Information et données'
        }
      });

      // when
      const area = serializer.deserialize(airtableArea);

      // then
      expect(area).to.be.an.instanceOf(Area);
      expect(area.id).to.be.equal('rec_area_id');
      expect(area.name).to.be.equal('1. Information et données');
      expect(area.code).to.be.equal('1');
      expect(area.title).to.be.equal('Information et données');
    });
  });
});
