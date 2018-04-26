const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/solution-serializer');
const Solution = require('../../../../../lib/domain/models/Solution');

describe('Unit | Serializer | solution-serializer', () => {

  describe('#deserialize', () => {

    it('should convert record "id" into "id" property', () => {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const solution = serializer.deserialize(airtableRecord);

      // then
      expect(solution.id).to.equal(airtableRecord.id);
    });

    it('should return a Domain Solution Object', () => {
      // given
      const airtableRecord = { id: 'rec123', fields: {} };

      // when
      const solution = serializer.deserialize(airtableRecord);

      // then
      expect(solution).to.be.an.instanceof(Solution);
    });

    [
      { airtableField: 'Type d\'épreuve', modelProperty: 'type' },
      { airtableField: 'Bonnes réponses', modelProperty: 'value' },

    ].forEach(({ airtableField, modelProperty }) => {

      it(`Should convert record '${airtableField}' field into '${modelProperty}' property`, () => {
        // given
        const fields = {};
        fields[airtableField] = `${modelProperty}_value`;
        const airtableRecord = { fields };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution[modelProperty]).to.equal(airtableRecord.fields[airtableField]);
      });

    });

    describe('Treatments options management', () => {

      it('should return [t1, t2, t3] when validation treatments are not defined in Airtable', () => {
        // given
        const airtableRecord = { fields: {} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't2', 't3']);
      });

      it('should return [t2, t3] when T1 is deactivated in Airtable', () => {
        // given
        const airtableRecord = {
          fields: {
            'T1 - Espaces, casse & accents': 'Désactivé'
          }
        };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal(['t2', 't3']);
      });

      it('should return [t1, t3] when T2 is deactivated in Airtable', () => {
        // given
        const airtableRecord = {
          fields: {
            'T2 - Ponctuation': 'Désactivé'
          }
        };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't3']);
      });

      it('should return [t1, t2] when T1 is deactivated in Airtable', () => {
        // given
        const airtableRecord = {
          fields: {
            'T3 - Distance d\'édition': 'Désactivé'
          }
        };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't2']);
      });

      it('should return [] when T1, T2 and T3 are deactivated in Airtable', () => {
        // given
        const airtableRecord = {
          fields: {
            'T1 - Espaces, casse & accents': 'Désactivé',
            'T2 - Ponctuation': 'Désactivé',
            'T3 - Distance d\'édition': 'Désactivé'
          }
        };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal([]);
      });

      it('should take into account 3 values: _blank_, "Activé", "Désactivé"', () => {
        // given
        const airtableRecord = {
          fields: {
            'T2 - Ponctuation': 'Activé',
            'T3 - Distance d\'édition': 'Désactivé'
          }
        };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.enabledTreatments).to.deep.equal(['t1', 't2']);
      });

    });

  });
});
