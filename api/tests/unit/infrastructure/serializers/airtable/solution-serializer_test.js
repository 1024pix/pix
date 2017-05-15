const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/airtable/solution-serializer');

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

    describe('Deactivations field', function() {

      it('should contain deactivations field as Object', function() {
        // given
        const airtableRecord = { fields: {} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution).to.include.keys('deactivations');
        expect(solution.deactivations).to.be.an('object');
      });

      it('should contain t1, t2 and t3', function() {
        // given
        const airtableRecord = { fields: {} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations).to.include.keys('t1', 't2', 't3');
      });

      it('should enable treatments by default (no value for fields t1, t2, t3 in airtable )', function() {
        // given
        const airtableRecord = { fields: {} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.false;
        expect(solution.deactivations.t2).to.be.false;
        expect(solution.deactivations.t3).to.be.false;
      });

      it('should set true to deactivations, when "désactiver T1" is true and "T1 - Espaces, casse & accents" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T1' : true, 'T1 - Espaces, casse & accents': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.true;
        expect(solution.deactivations.t2).to.be.false;
        expect(solution.deactivations.t3).to.be.false;
      });

      it('Should set false to deactivations, when "désactiver T1" is false and "T1 - Espaces, casse & accents" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T1' : false, 'T1 - Espaces, casse & accents': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.true;
        expect(solution.deactivations.t2).to.be.false;
        expect(solution.deactivations.t3).to.be.false;
      });

      it('should set true to deactivations, when "désactiver T2" is true and "T2 - Ponctuation" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T2' : true, 'T2 - Ponctuation': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.false;
        expect(solution.deactivations.t2).to.be.true;
        expect(solution.deactivations.t3).to.be.false;
      });

      it('should set true to deactivations, when "désactiver T2" is false and "T2 - Ponctuation" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T2' : false, 'T2 - Ponctuation': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.false;
        expect(solution.deactivations.t2).to.be.true;
        expect(solution.deactivations.t3).to.be.false;
      });

      it('should set true to deactivations, when "désactiver T3" is true and "T3 - Distance d\'édition" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T3' : true, 'T3 - Distance d\'édition': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.false;
        expect(solution.deactivations.t2).to.be.false;
        expect(solution.deactivations.t3).to.be.true;
      });

      it('should set true to deactivations, when "désactiver T3" is false and "T3 - Distance d\'édition" is Désactivé and transmitted from Airtable', function() {
        // given
        const airtableRecord = { fields: {'désactiver T3' : false, 'T3 - Distance d\'édition': 'Désactivé'} };

        // when
        const solution = serializer.deserialize(airtableRecord);

        // then
        expect(solution.deactivations.t1).to.be.false;
        expect(solution.deactivations.t2).to.be.false;
        expect(solution.deactivations.t3).to.be.true;
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
