import { expect, sinon } from '../../../test-helper';
import competenceTreeRepository from '../../../../lib/infrastructure/repositories/competence-tree-repository';
import areaRepository from '../../../../lib/infrastructure/repositories/area-repository';
import CompetenceTree from '../../../../lib/domain/models/CompetenceTree';

describe('Unit | Repository | competence-tree-repository', function () {
  beforeEach(function () {
    sinon.stub(areaRepository, 'listWithPixCompetencesOnly');
  });

  describe('#get', function () {
    it('should return a competence tree populated with Areas and Competences', async function () {
      // given
      const area = {
        id: 'recvoGdo7z2z7pXWa',
        code: '1',
        name: '1. Information et données',
        title: 'Information et données',
        color: 'jaffa',
        competences: [
          {
            id: 'recsvLz0W2ShyfD63',
            name: 'Mener une recherche et une veille d’information',
          },
          {
            id: 'recNv8qhaY887jQb2',
            name: 'Mener une recherche et une veille d’information',
          },
        ],
      };

      areaRepository.listWithPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves([area]);

      const expectedTree = {
        id: 1,
        areas: [
          {
            id: 'recvoGdo7z2z7pXWa',
            code: '1',
            name: '1. Information et données',
            title: 'Information et données',
            color: 'jaffa',
            competences: [
              {
                id: 'recsvLz0W2ShyfD63',
                name: 'Mener une recherche et une veille d’information',
              },
              {
                id: 'recNv8qhaY887jQb2',
                name: 'Mener une recherche et une veille d’information',
              },
            ],
          },
        ],
      };

      // when
      const competenceTree = await competenceTreeRepository.get({ locale: 'fr' });

      // then
      expect(competenceTree).to.be.an.instanceof(CompetenceTree);
      expect(competenceTree).to.deep.equal(expectedTree);
    });
  });
});
