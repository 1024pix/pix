const { Record: AirtableRecord } = require('airtable');
const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const tubeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tubeRawAirTableFixture');
const tubeAirtableDataModelFixture = require('../../../../tooling/fixtures/infrastructure/tubeAirtableDataObjectFixture');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

function makeAirtableFake(records) {
  return async (tableName, fieldList) => {
    return records.map((record) => new AirtableRecord(tableName, record.id,
      {
        id: record.id,
        fields: _.pick(record._rawJson.fields, fieldList)
      }));
  };
}

describe('Unit | Infrastructure | Datasource | Airtable | TubeDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = tubeAirtableDataModelFixture();

      // when
      const tube = tubeDatasource.fromAirTableObject(tubeRawAirTableFixture());

      // then
      expect(tube).to.deep.equal(expectedTube);
    });
  });

  describe('#findByNames', () => {

    it('should return an array of matching airtable tube data objects', async function() {
      // given
      const rawTube1 = tubeRawAirTableFixture();
      rawTube1.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_1' ;

      const rawTube2 = tubeRawAirTableFixture();
      rawTube2.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_2' ;

      const rawTube3 = tubeRawAirTableFixture();
      rawTube3.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_3' ;

      const rawTube4 = tubeRawAirTableFixture();
      rawTube4.fields['Nom'] = 'FAKE_NAME_RAW_TUBE_4' ;

      const records = [rawTube1, rawTube2, rawTube3, rawTube4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const foundTubes = await tubeDatasource.findByNames([
        rawTube1.fields['Nom'],
        rawTube2.fields['Nom'],
        rawTube4.fields['Nom'],
      ]);

      // then
      expect(foundTubes).to.be.an('array');
      expect(_.map(foundTubes, 'name')).to.deep.equal([rawTube1.fields['Nom'], rawTube2.fields['Nom'], rawTube4.fields['Nom']]);
      expect(airtable.findRecords).to.have.been.calledWith('Tubes');
    });
  });

});
