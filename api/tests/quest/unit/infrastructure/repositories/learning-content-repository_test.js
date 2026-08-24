import sinon from 'sinon';

import { FrameworkForCappedTubes } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/FrameworkForCappedTubes.js';
import * as learningContentRepository from '../../../../../src/quest/infrastructure/repositories/learning-content-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Repositories | Learning Content Repository', function () {
  describe('#findByTubeIds', function () {
    it('should call findByTubeIds from learningContentApi', async function () {
      // given
      const tubeIds = ['tubeId1'];
      const learningContent = {
        learningContentDTO: {
          frameworkDTOs: [
            {
              areaDTOs: [
                {
                  id: 'areaId',
                  code: 'code',
                  color: 'color',
                  title: 'title',
                  competenceDTOs: [
                    {
                      id: 'competenceId',
                      index: 'index',
                      name: 'name',
                      thematicDTOs: [{ id: 'thematicId', index: 'index', name: 'name', tubeDTOs: [{ id: 'tubeId1' }] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const expectedAreas = [
        {
          id: 'areaId',
          code: 'code',
          color: 'color',
          title: 'title',
          competences: [
            {
              id: 'competenceId',
              index: 'index',
              name: 'name',
              thematics: [{ id: 'thematicId', index: 'index', name: 'name', tubes: [{ id: 'tubeId1' }] }],
            },
          ],
        },
      ];

      const learningContentApiStub = {
        findByTubeIds: sinon.stub().withArgs({ tubeIds }).resolves(learningContent),
      };

      // when
      const result = await learningContentRepository.findByTubeIds({
        tubeIds,
        learningContentApi: learningContentApiStub,
      });

      // then
      expect(learningContentApiStub.findByTubeIds).called;
      expect(result.length).to.equal(1);
      expect(result[0]).to.be.instanceOf(FrameworkForCappedTubes);

      //then
      expect(result[0].areas).to.deep.equal(expectedAreas);
    });
  });
});
