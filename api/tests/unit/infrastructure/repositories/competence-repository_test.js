const { expect, sinon } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceDatasource = require('../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const AirtableNotFoundError = require('../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');

describe('Unit | Repository | competence-repository', () => {

  const areaData = {
    id: 'recArea',
    code: '1',
    name: 'Area name',
    title: 'Information et données',
    color: 'jaffa',
    competenceIds: ['recCompetence1', 'recCompetence2'],
  };

  const competenceData1 = {
    id: 'recCompetence1',
    name: 'Mener une recherche d’information',
    index: '1.1',
    description: 'Competence description 1',
    areaId: 'recArea',
    courseId: 'recCourse1',
    origin: 'Pix',
    skillIds: ['recSkill1', 'recSkill2'],
  };

  const competenceData2 = {
    id: 'recCompetence2',
    name: 'CompetenceName2',
    index: '1.2',
    description: 'Competence description 2',
    areaId: 'recArea',
    origin: 'Pix',
    courseId: 'recCourse2',
    skillIds: [],
  };

  const nonPixCompetenceData = {
    id: 'recNonPixCompetence',
    name: 'NonPixCompetenceName',
    index: '4.1',
    description: 'Non Pix Competence description',
    areaId: 'recArea',
    origin: 'Autre que Pix',
    courseId: 'recCourse2',
    skillIds: [],
  };

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list').resolves([areaData]);
    sinon.stub(competenceDatasource, 'list').resolves([competenceData2, competenceData1, nonPixCompetenceData]);
    sinon.stub(competenceDatasource, 'get');
  });

  describe('#list', () => {

    it('should return domain Competence objects sorted by index', () => {
      // when
      const fetchedCompetences = competenceRepository.list();

      // then
      return fetchedCompetences.then((competences) => {
        expect(competences).to.have.lengthOf(3);
        expect(competences[0]).to.be.an.instanceOf(Competence);
        expect(competences[0].index).to.equal('1.1');
        expect(competences[1].index).to.equal('1.2');
        expect(competences[2].index).to.equal('4.1');
      });
    });
  });

  describe('#listPixCompetencesOnly', () => {

    beforeEach(() => {
      competenceDatasource.get.withArgs('recCompetence1').resolves(competenceData1);
    });

    it('should return Pix only domain Competence objects sorted by index', () => {
      // when
      const fetchedCompetences = competenceRepository.listPixCompetencesOnly();

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

    it('should return a domain Competence object', () => {
      // when
      competenceDatasource.get.withArgs('recCompetence1').resolves(competenceData1);
      const fetchedCompetence = competenceRepository.get('recCompetence1');

      // then
      const expectedCompetence = new Competence({
        id: 'recCompetence1',
        index: '1.1',
        name: 'Mener une recherche d’information',
        description: 'Competence description 1',
        courseId: 'recCourse1',
        origin: 'Pix',
        skills: ['recSkill1', 'recSkill2'],
        area: new Area({
          id: 'recArea',
          code: '1',
          title: 'Information et données',
          color: 'jaffa',
        })
      });
      return fetchedCompetence.then((competence) => {
        expect(competence).to.be.an.instanceOf(Competence);
        expect(competence).to.deep.equal(expectedCompetence);
      });
    });

    it('should throw a domain NotFoundError when underlying datasources throw Exception', async () => {
      try {
        // given
        const competenceId = 'recAbcd1234';
        competenceDatasource.get.withArgs(competenceId).rejects(new AirtableNotFoundError());

        // when
        await competenceRepository.get(competenceId);
        expect.fail('Expected domain NotFoundError to have been thrown.');

      } catch (err) {

        // then
        expect(err).to.be.an.instanceOf(NotFoundError);
      }
    });
  });

  describe('#getCompetenceName', () => {

    it('should return a domain Competence name', async () => {
      // when
      competenceDatasource.get.withArgs('recCompetence1').resolves(competenceData1);
      const fetchedCompetenceName = await competenceRepository.getCompetenceName('recCompetence1');

      // then
      const expectedCompetence = new Competence({
        id: 'recCompetence1',
        index: '1.1',
        name: 'Mener une recherche d’information',
        courseId: 'recCourse',
        origin: 'Pix',
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
