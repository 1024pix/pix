const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/airtable/area-datasource');
const areaRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const { Area } = require('../../../../../lib/infrastructure/datasources/airtable/objects');

describe('Unit | Infrastructure | Datasource | Airtable | AreaDatasource', () => {

  describe('#list', () => {

    it('should call airtable on Domaines table with the id and return an Area dataObject', () => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([areaRawAirTableFixture()]);

      sinon.stub(Area, 'getUsedAirtableFields').returns(['field1', 'field2']);

      // when
      const promise = areaDatasource.list();

      // then
      return promise.then((areas) => {
        expect(airtable.findRecords).to.have.been.calledWith('Domaines', ['field1', 'field2']);

        expect(areas).to.have.lengthOf(1);
        expect(areas[0]).to.be.an.instanceof(Area);
        expect(areas[0].id).to.equal('recvoGdo7z2z7pXWa');
      });
    });
  });
});
