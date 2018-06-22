const { expect, sinon } = require('../../../test-helper');
const competenceTreeRepository = require('../../../../lib/infrastructure/repositories/competence-tree-repository');
const competenceDatasource = require('../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const CompetenceTree = require('../../../../lib/domain/models/CompetenceTree');
const factory = require('../../../factory');

describe('Unit | Repository | competence-tree-repository', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(areaDatasource, 'list');
    sandbox.stub(competenceDatasource, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    it('should return a the competence tree populated with Areas and Competences', () => {
      // given
      areaDatasource.list.resolves([factory.buildAreaAirtableDataObject()]);
      competenceDatasource.get.onFirstCall().resolves(factory.buildCompetenceAirtableDataObject({
        id: 'recsvLz0W2ShyfD63',
      }));
      competenceDatasource.get.onSecondCall().resolves(factory.buildCompetenceAirtableDataObject({
        id: 'recNv8qhaY887jQb2',
      }));
      competenceDatasource.get.onThirdCall().resolves(factory.buildCompetenceAirtableDataObject({
        id: 'recIkYm646lrGvLNT',
      }));

      const expectedTree = {
        id: 1,
        areas: [
          {
            id: 'recvoGdo7z2z7pXWa',
            code: '1',
            name: '1. Information et données',
            title: 'Information et données',
            competences: [
              {
                id: 'recsvLz0W2ShyfD63',
                name: 'Mener une recherche et une veille d’information',
                index: '1.1',
                area: undefined,
                courseId: undefined,
                skills: [],
              },
              {
                id: 'recNv8qhaY887jQb2',
                name: 'Mener une recherche et une veille d’information',
                index: '1.1',
                area: undefined,
                courseId: undefined,
                skills: [],
              },
              {
                id: 'recIkYm646lrGvLNT',
                name: 'Mener une recherche et une veille d’information',
                index: '1.1',
                area: undefined,
                courseId: undefined,
                skills: [],
              },
            ],
          },
        ],
      };

      // when
      const promise = competenceTreeRepository.get();

      // then
      return promise.then((result) => {
        expect(result).to.be.an.instanceof(CompetenceTree);
        expect(result).to.deep.equal(expectedTree);
        expect(areaDatasource.list).to.have.been.called;
        expect(competenceDatasource.get.firstCall).to.have.been.calledWith('recsvLz0W2ShyfD63');
        expect(competenceDatasource.get.secondCall).to.have.been.calledWith('recNv8qhaY887jQb2');
        expect(competenceDatasource.get.thirdCall).to.have.been.calledWith('recIkYm646lrGvLNT');
      });
    });
  });
});
