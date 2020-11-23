const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/area-datasource');
const areaRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const makeAirtableFake = require('../../../../tooling/airtable-builder/make-airtable-fake');
const airtable = require('../../../../../lib/infrastructure/airtable');

describe('Unit | Infrastructure | Datasource | Airtable | AreaDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = domainBuilder.buildAreaAirtableDataObject();

      // when
      const area = areaDatasource.fromAirTableObject(areaRawAirTableFixture());

      // then
      expect(area).to.deep.equal(expectedArea);
    });
  });

  describe('#findByRecordIds', () => {

    it('should return an array of matching airtable area data objects', async function() {
      // given
      const rawArea1 = areaRawAirTableFixture('RECORD_ID_RAW_AREA_1');
      const rawArea2 = areaRawAirTableFixture('RECORD_ID_RAW_AREA_2');
      const rawArea3 = areaRawAirTableFixture('RECORD_ID_RAW_AREA_3');
      const rawArea4 = areaRawAirTableFixture('RECORD_ID_RAW_AREA_4');

      const records = [rawArea1, rawArea2, rawArea3, rawArea4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));
      const expectedAreaIds = [
        rawArea1.fields['id persistant'],
        rawArea2.fields['id persistant'],
        rawArea4.fields['id persistant'],
      ];

      // when
      const foundAreas = await areaDatasource.findByRecordIds(expectedAreaIds);
      // then
      expect(foundAreas.map(({ id }) => id)).to.deep.equal(expectedAreaIds);
    });

    it('should return an empty array when there are no objects matching the ids', async function() {
      // given
      const rawArea1 = areaRawAirTableFixture('RECORD_ID_RAW_AREA_1');

      const records = [rawArea1];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const foundAreas = await areaDatasource.findByRecordIds(['some_other_id']);

      // then
      expect(foundAreas).to.be.empty;
    });
  });

});
