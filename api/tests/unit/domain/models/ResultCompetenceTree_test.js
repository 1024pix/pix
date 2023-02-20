import { expect, domainBuilder } from '../../../test-helper';
import ResultCompetence from '../../../../lib/domain/models/ResultCompetence';
import ResultCompetenceTree from '../../../../lib/domain/models/ResultCompetenceTree';

describe('Unit | Domain | Models | ResultCompetence', function () {
  describe('#generateTreeFromCompetenceMarks', function () {
    it(
      'should return the tree with the resultCompetence filled with -1 if no mark ' +
        ' or the real mark if the mark exists',
      function () {
        const competenceTree = domainBuilder.buildCompetenceTree();
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          id: 1,
          competence_code: '1.1',
          level: 2,
          score: 13,
        });
        const competenceMark3 = domainBuilder.buildCompetenceMark({
          id: 3,
          competence_code: '1.3',
          level: 4,
          score: 22,
        });

        const competenceMarks = [competenceMark1, competenceMark3];

        const expectedResultTree = {
          id: '123-456',
          areas: [
            {
              id: 'recvoGdo7z2z7pXWa',
              code: '1',
              name: '1. Information et données',
              title: 'Information et données',
              color: 'jaffa',
              frameworkId: 'recAi12kj43h23jrh3',
              resultCompetences: [
                {
                  id: 'recsvLz0W2ShyfD63',
                  index: '1.1',
                  name: 'Mener une recherche et une veille d’information',
                  level: 2,
                  score: 13,
                },
                {
                  id: 'recNv8qhaY887jQb2',
                  name: 'Mener une recherche et une veille d’information',
                  index: '1.2',
                  level: -1,
                  score: 0,
                },
                {
                  id: 'recIkYm646lrGvLNT',
                  name: 'Mener une recherche et une veille d’information',
                  index: '1.3',
                  level: 4,
                  score: 22,
                },
              ],
            },
          ],
        };

        // when
        const resultTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
          competenceTree,
          competenceMarks,
          certificationId: 123,
          assessmentResultId: 456,
        });

        // then
        expect(resultTree).to.be.an.instanceOf(ResultCompetenceTree);
        expect(resultTree.areas[0].resultCompetences[0]).to.be.an.instanceOf(ResultCompetence);
        expect(resultTree).to.deep.equal(expectedResultTree);
      }
    );
  });
});
