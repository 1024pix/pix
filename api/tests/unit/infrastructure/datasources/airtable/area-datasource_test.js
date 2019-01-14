const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/airtable/area-datasource');
const areaRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const airTableDataObjects = require('../../../../../lib/infrastructure/datasources/airtable/objects');

describe('Unit | Infrastructure | Datasource | Airtable | AreaDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    it('should call airtable on Domaines table with the id and return an Area dataObject', () => {
      // given
      sandbox.stub(airtable, 'findRecords').resolves([areaRawAirTableFixture()]);

      // when
      const promise = areaDatasource.list();

      // then
      return promise.then((areas) => {
        expect(airtable.findRecords).to.have.been.calledWith('Domaines');

        expect(areas).to.have.lengthOf(1);
        expect(areas[0]).to.be.an.instanceof(airTableDataObjects.Area);
        expect(areas[0].id).to.equal('recvoGdo7z2z7pXWa');
      });
    });
  });
});
