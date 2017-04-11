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

    describe('Treatments options management', function () {

      it('should return [t1, t2, t3] when treatments deactivations are not defined in Airtable', function () {
        // given
        const fields = [];
        const airtableRecord = { fields };
        // when
        const solution = serializer.deserialize(airtableRecord);
        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't2', 't3']);
      });

      it('should return [t2, t3] when T1 is deactivated in Airtable', function () {
        // given
        const airtableRecord = {
          fields: {
            'désactiver T1': true
          }
        };
        // when
        const solution = serializer.deserialize(airtableRecord);
        // then
        expect(solution.enabledTreatments).to.deep.equal(['t2', 't3']);
      });

      it('should return [t1, t3] when T2 is deactivated in Airtable', function () {
        // given
        const airtableRecord = {
          fields: {
            'désactiver T2': true
          }
        };
        // when
        const solution = serializer.deserialize(airtableRecord);
        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't3']);
      });

      it('should return [t1, t2] when T1 is deactivated in Airtable', function () {
        // given
        const airtableRecord = {
          fields: {
            'désactiver T3': true
          }
        };
        // when
        const solution = serializer.deserialize(airtableRecord);
        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't2']);
      });

      it('should return [] when T1, T2 and T3 are deactivated in Airtable', function () {
        // given
        const airtableRecord = {
          fields: {
            'désactiver T1': true,
            'désactiver T2': true,
            'désactiver T3': true
          }
        };
        // when
        const solution = serializer.deserialize(airtableRecord);
        // then
        expect(solution.enabledTreatments).to.deep.equal([]);
      });

    });
  });
});
