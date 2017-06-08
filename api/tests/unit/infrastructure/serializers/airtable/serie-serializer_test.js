const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/serie-serializer');
const Serie = require('../../../../../lib/domain/models/referential/serie');

describe('Unit | Serializer | serie-serializer', function() {

  describe('#deserialize', function() {

    it('should return a serie object', function() {
      // given
      const airtableRecord = { id: 'recFake', fields: {} };
      // when
      const serie = serializer.deserialize(airtableRecord);
      // then
      expect(serie instanceof Serie).to.be.true;
    });

    it('should convert id field of airtable to id in Serie object', function() {
      //given
      const airtableRecord = { id: 'recFake' };

      //when
      const serie = serializer.deserialize(airtableRecord);

      //then
      expect(serie.id).to.be.equal(airtableRecord.id);
    });

    it('should convert "nom" field of airtable to "nom" in Serie object', function() {
      //given
      const airtableRecord = {
        fields: {
          nom: 'fakeName'
        }
      };

      //when
      const serie = serializer.deserialize(airtableRecord);

      //then
      expect(serie.name).to.be.equal(airtableRecord.fields['nom']);
    });

    it('should convert "nom" field of airtable to "nom" in Serie object', function() {

      //given
      const airtableRecord = {
        fields: {
          courses: [{id:'test1'}, {id:'test2'}]
        }
      };

      //when
      const serie = serializer.deserialize(airtableRecord);

      //then
      expect(serie.tests).to.be.equal(airtableRecord.fields['tests']);
    });

  });

});
