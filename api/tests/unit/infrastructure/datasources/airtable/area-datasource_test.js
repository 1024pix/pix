const { expect, domainBuilder } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/airtable/area-datasource');
const areaRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');

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

});
