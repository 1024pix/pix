const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/area-serializer');
const Area = require('../../../../../lib/domain/models/Area');

describe('Unit | Serializer | area-serializer', function() {
  describe('#Deserialize', () => {
    it('should be a function', function() {
      // then
      expect(serializer.deserialize).to.be.a('function');
    });

    it('should return a new Area Model object', () => {
      // Given
      const airtableAreaRecord = {
        id: 'recsvLDFHShyfDXXXXX',
        fields: {
          'Nom': '1. Information et données',
        }
      };

      // When
      const area = serializer.deserialize(airtableAreaRecord);

      // Then
      expect(area).to.be.an.instanceOf(Area);
      expect(area.id).to.be.equal(airtableAreaRecord.id);
      expect(area.name).to.be.equal(airtableAreaRecord.fields['Nom']);
    });
  });
});
