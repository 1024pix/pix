const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/competence-datasource');
const airtable = require('../../../../../lib/infrastructure/airtable');
const competenceRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/competenceRawAirTableFixture');
const makeAirtableFake = require('../../../../tooling/airtable-builder/make-airtable-fake');

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = domainBuilder.buildCompetenceAirtableDataObject();

      // when
      const area = competenceDatasource.fromAirTableObject(competenceRawAirTableFixture());

      // then
      expect(area).to.deep.equal(expectedCompetence);
    });
  });

  describe('#findByRecordIds', () => {

    it('should return an array of matching airtable competence data objects', async function() {
      // given
      const rawCompetence1 = competenceRawAirTableFixture('RECORD_ID_RAW_COMPETENCE_1');
      const rawCompetence2 = competenceRawAirTableFixture('RECORD_ID_RAW_COMPETENCE_2');
      const rawCompetence3 = competenceRawAirTableFixture('RECORD_ID_RAW_COMPETENCE_3');
      const rawCompetence4 = competenceRawAirTableFixture('RECORD_ID_RAW_COMPETENCE_4');

      const records = [rawCompetence1, rawCompetence2, rawCompetence3, rawCompetence4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));
      const expectedCompetenceIds = [
        rawCompetence1.fields['id persistant'],
        rawCompetence2.fields['id persistant'],
        rawCompetence4.fields['id persistant'],
      ];

      // when
      const foundCompetences = await competenceDatasource.findByRecordIds(expectedCompetenceIds);
      // then
      expect(foundCompetences.map(({ id }) => id)).to.deep.equal(expectedCompetenceIds);
    });

    it('should return an empty array when there are no objects matching the ids', async function() {
      // given
      const rawCompetence1 = competenceRawAirTableFixture('RECORD_ID_RAW_COMPETENCE_1');

      const records = [rawCompetence1];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const foundCompetences = await competenceDatasource.findByRecordIds(['some_other_id']);

      // then
      expect(foundCompetences).to.be.empty;
    });
  });

});
