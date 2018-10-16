const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const Area = require('../../../../lib/domain/models/Area');
const airTableDataObjects = require('../../../../lib/infrastructure/datasources/airtable/objects');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceDatasource = require('../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Unit | Repository | competence-repository', () => {

  const sandbox = sinon.sandbox.create();

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

  afterEach(() => {
    sandbox.restore();
  });

  describe('#list', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([rawCompetence1, rawCompetence2]);
    });

    it('should fetch all competence records from Airtable "Competences" table', () => {
      // when
      const fetchedCompetences = competenceRepository.list();

      // then
      return fetchedCompetences.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Competences', {});
      });
    });

    it('should return domain Competence objects', () => {
      // when
      const fetchedCompetences = competenceRepository.list();

      // then
      return fetchedCompetences.then((competences) => {
        expect(competences).to.have.lengthOf(2);
        expect(competences[0]).to.be.an.instanceOf(Competence);
      });
    });
  });

  describe('#get', () => {
    const competenceData1 = new airTableDataObjects.Competence({
      id: 'recCompetence1',
      name: 'Mener une recherche d’information',
      index: '1.1',
      courseId: 'recCourse',
      skillIds: ['recSkill1', 'recSkill2'],
      areaId: 'recArea',
    });

    beforeEach(() => {
      // given
      sandbox.stub(competenceDatasource, 'get')
        .withArgs('recCompetence1')
        .resolves(competenceData1);

      sandbox.stub(areaDatasource, 'list')
        .resolves([
          new airTableDataObjects.Area({
            id: 'recArea',
            code: '1',
            title: 'Information et données',
          })
        ]);
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

  describe('#find', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([rawCompetence1, rawCompetence2]);
    });

    it('should fetch all competence records from Airtable "Competences" table sorted by index', () => {
      // given
      const expectedQuery = { sort: [{ field: 'Sous-domaine', direction: 'asc' }] };

      // when
      const promise = competenceRepository.find();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Competences', expectedQuery);
      });
    });

    it('should return Competence domain objects', () => {
      // when
      const promise = competenceRepository.find();

      // then
      return promise.then((competences) => {
        expect(competences).to.have.lengthOf(2);
        expect(competences[0]).to.be.an.instanceOf(Competence);
      });
    });
  });

  describe('#_rawToDomain', () => {

    it('should match Competence domain object content', () => {
      // given
      sandbox.stub(airtable, 'findRecords').resolves([rawCompetence1]);

      const expectedArea = new Area({
        id: 'recArea',
        code: '1',
        title: 'Information et données'
      });

      const expectedCompetence = new Competence({
        id: 'recCompetence1',
        index: '1.1',
        name: 'Mener une recherche d’information',
        courseId: 'recAY0W7x9urA11OLZJJ',
        skills: ['@url2', '@url5', '@utiliserserv6'],
        area: expectedArea
      });

      // when
      const promise = competenceRepository.find();

      // then
      return promise.then((competences) => {
        expect(competences[0]).to.be.an.instanceOf(Competence);
        expect(competences[0]).to.deep.equal(expectedCompetence);
      });
    });
  });

});
