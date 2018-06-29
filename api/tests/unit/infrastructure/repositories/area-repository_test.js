const { expect, sinon, factory } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');

const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Unit | Repository | area-repository', function() {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(areaDatasource, 'list');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    beforeEach(() => {
      areaDatasource.list.resolves([
        factory.buildAreaAirtableDataObject({
          id: 'recDomaine1',
          code: '1',
          title: 'Domaine 1',
          name: '1. Domaine 1',
        }),
        factory.buildAreaAirtableDataObject({
          id: 'recDomaine2',
          code: '2',
          title: 'Domaine 2',
          name: '2. Domaine 2',
        }),
      ]);
    });

    it('should fetch all area records from Airtable "Domaines" table', () => {
      // when
      const fetchedAreas = areaRepository.list();

      // then
      return fetchedAreas.then(() => {
        expect(areaDatasource.list).to.have.been.called;
      });
    });

    it('should return domain Area objects', () => {
      // given
      const expectedAreas = [
        new Area({
          id: 'recDomaine1',
          name: '1. Domaine 1',
          code: '1',
          title: 'Domaine 1',
        }),
        new Area({
          id: 'recDomaine2',
          name: '2. Domaine 2',
          code: '2',
          title: 'Domaine 2',
        }),
      ];

      // when
      const fetchedAreas = areaRepository.list();

      // then
      return fetchedAreas.then((areas) => {
        expect(areas).to.deep.equal(expectedAreas);
        expect(areas[0]).to.be.an.instanceOf(Area);
      });
    });
  });
});
