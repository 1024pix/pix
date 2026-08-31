import { expect } from 'chai';
import sinon from 'sinon';

import { AreaForCappedTubes } from '../../../../../src/quest/domain/models/combined-course-blueprints/value-objects/AreaForCappedTubes.js';
import * as learningContentRepository from '../../../../../src/quest/infrastructure/repositories/learning-content-repository.js';

describe('Unit | Repositories | Learning Content Repository', function () {
  describe('#findAreasForTubeIds', function () {
    it('should return formatted Areas from learning content', async function () {
      // given
      const tubeIds = ['tubeId1'];
      const tubesWithLevel = [['tubeId1', 3]];
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
                      thematicDTOs: [
                        {
                          id: 'thematicId',
                          index: 'index',
                          name: 'name',
                          tubeDTOs: [{ id: 'tubeId1', name: 'name', practicalTitle: 'practicalTitle' }],
                        },
                      ],
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
              thematics: [
                {
                  id: 'thematicId',
                  index: 'index',
                  name: 'name',
                  tubes: [{ id: 'tubeId1', level: 3, name: 'name', practicalTitle: 'practicalTitle' }],
                },
              ],
            },
          ],
        },
      ];

      const learningContentApiStub = {
        findByTubeIds: sinon.stub().withArgs({ tubeIds }).resolves(learningContent),
      };

      // when
      const result = await learningContentRepository.findAreasForTubeIds({
        tubesWithLevel,
        learningContentApi: learningContentApiStub,
      });

      // then
      expect(result.length).to.equal(1);
      expect(result[0]).to.be.instanceOf(AreaForCappedTubes);
      expect(result).to.deep.equal(expectedAreas);
    });
  });
});
