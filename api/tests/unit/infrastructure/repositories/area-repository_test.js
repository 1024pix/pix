const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Unit | Repository | area-repository', function() {

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list');

    areaDatasource.list.resolves([
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine1',
        code: '1',
        titleFrFr: 'Domaine 1',
        titleEnUs: 'Area 1',
        name: '1. Domaine 1',
        color: 'emerald',
      }),
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine2',
        code: '2',
        titleFrFr: 'Domaine 2',
        titleEnUs: 'Area 2',
        name: '2. Domaine 2',
        color: 'wild-strawberry',
      }),
    ]);
  });

  describe('#list', () => {

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
          color: 'emerald',
        }),
        new Area({
          id: 'recDomaine2',
          name: '2. Domaine 2',
          code: '2',
          title: 'Domaine 2',
          color: 'wild-strawberry',
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

  describe('#listWithPixCompetencesOnly', () => {
    const competence1 = domainBuilder.buildCompetence({
      area: { id: 'recDomaine1' }
    });
    const competence2 = domainBuilder.buildCompetence({
      area: { id: 'recDomaine2' }
    });
    const nonPixCompetence = domainBuilder.buildCompetence({
      area: { id: 'recDomaine3' },
      origin: 'Other'
    });

    beforeEach(() => {
      sinon.stub(competenceRepository, 'listPixCompetencesOnly');
      competenceRepository.listPixCompetencesOnly.resolves([
        competence1,
        competence2,
        nonPixCompetence,
      ]);
    });

    it('should add competences to Area objects', () => {
      // given
      const expectedAreas = [
        new Area({
          id: 'recDomaine1',
          name: '1. Domaine 1',
          code: '1',
          title: 'Domaine 1',
          color: 'emerald',
          competences: [
            competence1
          ],
        }),
        new Area({
          id: 'recDomaine2',
          name: '2. Domaine 2',
          code: '2',
          title: 'Domaine 2',
          color: 'wild-strawberry',
          competences: [
            competence2
          ],
        }),
      ];

      // when
      const fetchedAreas = areaRepository.listWithPixCompetencesOnly();

      // then
      return fetchedAreas.then((areas) => {
        expect(areas).to.deep.equal(expectedAreas);
      });
    });
  });
});
