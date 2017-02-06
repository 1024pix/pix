const { describe, it } = require('mocha');
const { expect } = require('chai');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/course-serializer');

describe('Unit | Serializer | course-serializer', function () {

  describe('#deserialize', function () {

    it('should convert record "id" into "id" property', function () {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const course = serializer.deserialize(airtableRecord);

      // then
      expect(course.id).to.equal(airtableRecord.id);
    });

    [
      { airtableField: 'Nom', modelProperty: 'name' },
      { airtableField: 'Description', modelProperty: 'description' },
      { airtableField: 'Durée', modelProperty: 'duration' },
      { airtableField: 'Adaptatif ?', modelProperty: 'isAdaptive' }
    ].forEach(({ airtableField, modelProperty }) => {

      it(`should convert record '${airtableField}' field into '${modelProperty}' property`, function () {
        // given
        const fields = [];
        fields[airtableField] = `${modelProperty}_value`;
        const airtableRecord = { fields };

        // when
        const course = serializer.deserialize(airtableRecord);

        // then
        expect(course[modelProperty]).to.equal(airtableRecord.fields[airtableField]);
      });

    });

  });
});
