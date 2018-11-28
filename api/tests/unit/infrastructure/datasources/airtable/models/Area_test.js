const dataObjects = require('../../../../../../lib/infrastructure/datasources/airtable/objects/index');
const areaRawAirTableFixture = require('../../../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const { expect, factory } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Area', () => {

  context('#fromAirTableObject', () => {

    it('should create a Area from the AirtableRecord', () => {
      // given
      const expectedArea = factory.buildAreaAirtableDataObject();

      // when
      const area = dataObjects.Area.fromAirTableObject(areaRawAirTableFixture());

      // then
      expect(area).to.be.an.instanceof(dataObjects.Area);
      expect(area).to.deep.equal(expectedArea);
    });
  });
});
