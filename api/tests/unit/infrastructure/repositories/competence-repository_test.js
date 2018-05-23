const { expect, sinon } = require('../../../test-helper');
const AirtableRecord = require('airtable').Record;
const airtable = require('../../../../lib/infrastructure/airtable');
const Area = require('../../../../lib/domain/models/Area');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Unit | Repository | competence-repository', () => {

  const sandbox = sinon.sandbox.create();

  const competence1 = new AirtableRecord('Competences', 'recCompetence1', {
    fields: {
      'Titre': 'Mener une recherche d’information',
      'Sous-domaine': '1.1',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis': ['@url2', '@url5', '@utiliserserv6'],
      'Domaine': ['recArea'],
      'Domaine Code': ['1'],
      'Domaine Titre': ['Information et données'],
    }
  });

  const competence2 = new AirtableRecord('Competences', 'recCompetence2', {
    fields: {
      'Titre': 'Gérer des données',
      'Sous-domaine': '1.2',
      'Tests Record ID': ['recAY0W7x9urA11OLZJJ'],
      'Acquis': ['@url2', '@url5', '@utiliserserv6'],
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
      sandbox.stub(airtable, 'findRecords').resolves([competence1, competence2]);
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

    beforeEach(() => {
      sandbox.stub(airtable, 'newGetRecord').resolves(competence1);
    });

    it('should fetch all competence records from Airtable "Competences" table', () => {
      // given
      const recordId = 'recCompetence1';

      // when
      const fetchedCompetence = competenceRepository.get(recordId);

      // then
      return fetchedCompetence.then(() => {
        expect(airtable.newGetRecord).to.have.been.calledWith('Competences', recordId);
      });
    });

    it('should return a domain Competence object', () => {
      // given
      const recordId = 'recCompetence1';

      // when
      const fetchedCompetence = competenceRepository.get(recordId);

      // then
      return fetchedCompetence.then((competence) => {
        expect(competence).to.exist;
        expect(competence).to.be.an.instanceOf(Competence);
      });
    });
  });

  describe('#find', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([competence1, competence2]);
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

  describe('#_toDomain', () => {

    it('should match Competence domain object content', () => {
      // given
      sandbox.stub(airtable, 'findRecords').resolves([competence1]);

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
