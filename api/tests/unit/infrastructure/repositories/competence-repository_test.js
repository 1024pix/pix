const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const Area = require('../../../../lib/domain/models/Area');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceDatasource = require('../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Unit | Repository | competence-repository', () => {

  const rawCompetence1 = new AirtableRecord('Competences', 'recCompetence1', {
    fields: {
      'Titre': 'Mener une recherche d’information',
      'Sous-domaine': '1.1',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis (via Tubes)': ['@url2', '@url5', '@utiliserserv6'],
      'Domaine': ['recArea'],
      'Domaine Code': ['1'],
      'Domaine Titre': ['Information et données'],
    }
  });

  const rawCompetence2 = new AirtableRecord('Competences', 'recCompetence2', {
    fields: {
      'Titre': 'Gérer des données',
      'Sous-domaine': '1.2',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis (via Tubes)': ['@url2', '@url5', '@utiliserserv6'],
      'Domaine': ['recArea'],
      'Domaine Code': ['1'],
      'Domaine Titre': ['Information et données'],
    }
  });

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list')
      .resolves([
        {
          id: 'recArea',
          code: '1',
          title: 'Information et données',
        }
      ]);
  });

  describe('#list', () => {

    beforeEach(() => {
      sinon.stub(airtable, 'findRecords')
        .withArgs('Competences')
        .resolves([rawCompetence2, rawCompetence1]);
    });

    it('should return domain Competence objects sorted by index', () => {
      // when
      const fetchedCompetences = competenceRepository.list();

      // then
      return fetchedCompetences.then((competences) => {
        expect(competences).to.have.lengthOf(2);
        expect(competences[0]).to.be.an.instanceOf(Competence);
        expect(competences[0].index).to.equal('1.1');
        expect(competences[1].index).to.equal('1.2');
      });
    });
  });

  describe('#get', () => {
    const competenceData1 = {
      id: 'recCompetence1',
      name: 'Mener une recherche d’information',
      index: '1.1',
      courseId: 'recCourse',
      skillIds: ['recSkill1', 'recSkill2'],
      areaId: 'recArea',
    };

    beforeEach(() => {
      // given
      sinon.stub(competenceDatasource, 'get')
        .withArgs('recCompetence1')
        .resolves(competenceData1);
    });

    it('should return a domain Competence object', () => {
      // when
      const fetchedCompetence = competenceRepository.get('recCompetence1');

      // then
      const expectedCompetence = new Competence({
        id: 'recCompetence1',
        index: '1.1',
        name: 'Mener une recherche d’information',
        courseId: 'recCourse',
        skills: ['recSkill1', 'recSkill2'],
        area: new Area({
          id: 'recArea',
          code: '1',
          title: 'Information et données',
        })
      });
      return fetchedCompetence.then((competence) => {
        expect(competence).to.be.an.instanceOf(Competence);
        expect(competence).to.deep.equal(expectedCompetence);
      });
    });
  });

  describe('#getCompetenceName', () => {
    const competenceData1 = {
      id: 'recCompetence1',
      name: 'Mener une recherche d’information',
      index: '1.1',
      courseId: 'recCourse',
      skillIds: ['recSkill1', 'recSkill2'],
      areaId: 'recArea',
    };

    beforeEach(() => {
      // given
      sinon.stub(competenceDatasource, 'get')
        .withArgs('recCompetence1')
        .resolves(competenceData1);
    });

    it('should return a domain Competence name', async () => {
      // when
      const fetchedCompetenceName = await competenceRepository.getCompetenceName('recCompetence1');

      // then
      const expectedCompetence = new Competence({
        id: 'recCompetence1',
        index: '1.1',
        name: 'Mener une recherche d’information',
        courseId: 'recCourse',
        skills: ['recSkill1', 'recSkill2'],
        area: new Area({
          id: 'recArea',
          code: '1',
          title: 'Information et données',
        })
      });

      expect(fetchedCompetenceName).to.deep.equal(expectedCompetence.name);
    });
  });
});
