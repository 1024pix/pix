const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const tubeDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tube-datasource');
const tubeRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tubeRawAirTableFixture');
const { Tube } = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const AirtableRecord = require('airtable').Record;
const _ = require('lodash');

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

  describe('#findByNames', () => {

    it('should return an array of airtable tube data objects', async function() {
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
      expect(foundTubes[0]).to.be.an.instanceOf(Tube);
      expect(foundTubes[1]).to.be.an.instanceOf(Tube);
      expect(_.map(foundTubes, 'name')).to.deep.equal([rawTube1.fields['Nom'], rawTube2.fields['Nom'], rawTube4.fields['Nom']]);
      expect(airtable.findRecords).to.have.been.calledWith('Tubes');
    });
  });

  describe('#get', () => {

    it('should call airtable on Tube table with the id and return a datamodel Tube object', () => {
      // given
      const rawTube = tubeRawAirTableFixture();
      sinon.stub(airtable, 'getRecord').withArgs('Tubes', rawTube.id).resolves(rawTube);

      // when
      const promise = tubeDatasource.get(rawTube.id);

      // then
      return promise.then((tube) => {
        expect(airtable.getRecord).to.have.been.calledWith('Tubes', rawTube.id);

        expect(tube).to.be.an.instanceof(Tube);
        expect(tube.id).to.equal(rawTube.id);
      });
    });
  });

  describe('#list', () => {

    it('should query Airtable tubes with empty query', async () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      sinon.stub(Tube, 'getUsedAirtableFields').returns(['titi', 'toto']);

      // when
      await tubeDatasource.list();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Tubes', ['titi', 'toto']);
    });

    it('should resolve an array of Tubes from airTable', async () => {
      // given
      const
        rawTube1 = tubeRawAirTableFixture(),
        rawTube2 = tubeRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawTube1, rawTube2]));

      // when
      const foundTubes = await tubeDatasource.list();

      // then
      expect(foundTubes[0]).to.be.an.instanceOf(Tube);
      expect(_.map(foundTubes, 'id')).to.deep.equal([rawTube1.id, rawTube2.id]);
    });
  });
});
