const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
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

  describe('#list', () => {

    it('should call airtable on Domaines table with the id and return an Area dataObject', () => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([areaRawAirTableFixture()]);

      // when
      const promise = areaDatasource.list();

      // then
      return promise.then((areas) => {
        expect(airtable.findRecords).to.have.been.calledWith('Domaines', areaDatasource.usedFields);

        expect(areas).to.have.lengthOf(1);
        expect(areas[0].id).to.equal('recvoGdo7z2z7pXWa');
      });
    });
  });
});
