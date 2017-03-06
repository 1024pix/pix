const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/solution-serializer');

describe('Unit | Serializer | solution-serializer', function () {

  describe('#deserialize', function () {

    it('should convert record "id" into "id" property', function () {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const solution = serializer.deserialize(airtableRecord);

      // then
      expect(solution.id).to.equal(airtableRecord.id);
    });

    [
      { airtableField: 'Type d\'épreuve', modelProperty: 'type' },
      { airtableField: 'Bonnes réponses', modelProperty: 'value' },

    ].forEach(({ airtableField, modelProperty }) => {

      it(`Should convert record '${airtableField}' field into '${modelProperty}' property`, function () {
        // given
        const fields = [];
        fields[airtableField] = `${modelProperty}_value`;
        const airtableRecord = { fields };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution[modelProperty]).to.equal(airtableRecord.fields[airtableField]);
      });

    });

    it('Should generate an empty deactivations property by default', function () {

      // given
      const airtableRecord = { fields: {} };

      // when
      const solution = serializer.deserialize(airtableRecord);

      // then
      expect(solution.deactivations).to.deep.equal({t1: undefined, t2: undefined, t3: undefined});

    });

    it('Should be able to deactivate t1, t2, t3', function () {

      // given
      const airtableRecord = {
        fields:
        {'désactiver T1': 't1',
          'désactiver T2': 't2',
          'désactiver T3': 't3'}
      };

      // when
      const solution = serializer.deserialize(airtableRecord);

      // then
      expect(solution.deactivations).to.deep.equal({t1: 't1', t2: 't2', t3: 't3'});

    });


  });
});
