const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const AirtableRecord = require('airtable').Record;

const Area = require('../../../../lib/domain/models/Area');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Unit | Repository | area-repository', function() {

  beforeEach(() => {
    sinon.stub(airtable, 'findRecords');
  });

  afterEach(() => {
    airtable.findRecords.restore();
  });

  describe('#list', () => {

    beforeEach(() => {
      const area1 = new AirtableRecord('Domaines', 'recDomaine1', {
        fields: {
          'Nom': '1. Domaine 1',
          'Code': '1',
          'Titre': 'Domaine 1'
        }
      });
      const area2 = new AirtableRecord('Domaines', 'recDomaine2', {
        fields: {
          'Nom': '2. Domaine 2',
          'Code': '2',
          'Titre': 'Domaine 2'
        }
      });
      airtable.findRecords.resolves([area1, area2]);
    });

    it('should fetch all area records from Airtable "Domaines" table', () => {
      // when
      const fetchedAreas = areaRepository.list();

      // then
      return fetchedAreas.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Domaines', {});
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
        })
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
