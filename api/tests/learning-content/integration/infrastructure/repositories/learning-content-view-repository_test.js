import { AreaView } from '../../../../../src/learning-content/domain/models/AreaView.js';
import { CompetenceView } from '../../../../../src/learning-content/domain/models/CompetenceView.js';
import { FrameworkView } from '../../../../../src/learning-content/domain/models/FrameworkView.js';
import { LearningContentView } from '../../../../../src/learning-content/domain/models/LearningContentView.js';
import { ThematicView } from '../../../../../src/learning-content/domain/models/ThematicView.js';
import { TubeView } from '../../../../../src/learning-content/domain/models/TubeView.js';
import { findByTubeIds } from '../../../../../src/learning-content/infrastructure/repositories/learning-content-view-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Learning Content | Integration | Repositories | Learning Content View', function () {
  afterEach(async function () {
    await knex('learningcontent.frameworks').truncate();
    await knex('learningcontent.areas').truncate();
    await knex('learningcontent.competences').truncate();
    await knex('learningcontent.thematics').truncate();
    await knex('learningcontent.tubes').truncate();
  });

  describe('#findByTubeIds', function () {
    it('returns learningContentView with no frameworks', async function () {
      // when
      const result = await findByTubeIds(['tube1', 'tube2']);

      // then
      expect(result).deepEqualInstance(
        new LearningContentView({
          frameworkViews: [],
        }),
      );
    });

    it('returns learningContentView with frameworks', async function () {
      // given
      const learningContent = {
        frameworks: [
          { id: 'framework1', name: 'FrameWork1' },
          { id: 'framework2', name: 'FrameWork2' },
        ],
        areas: [
          {
            id: 'area1',
            title_i18n: { fr: 'area1' },
            code: '1',
            color: 'red',
            frameworkId: 'framework1',
            competenceIds: ['comp1'],
          },
          {
            id: 'area2',
            title_i18n: { fr: 'area2' },
            code: '18',
            color: 'green',
            frameworkId: 'framework2',
            competenceIds: ['comp2'],
          },
        ],
        competences: [
          { id: 'comp1', areaId: 'area1', index: '1.1', name_i18n: { fr: 'comp1' } },
          { id: 'comp2', areaId: 'area2', index: '18.1', name_i18n: { fr: 'comp2' } },
        ],
        thematics: [
          { id: 'them1', competenceId: 'comp1', index: 1, name_i18n: { fr: 'them1' } },
          { id: 'them2', competenceId: 'comp2', index: 18, name_i18n: { fr: 'them2' } },
        ],
        tubes: [
          {
            id: 'tube1',
            thematicId: 'them1',
            name: '@tube_one',
            competenceId: 'comp1',
            practicalTitle_i18n: {
              fr: 'tube1',
            },
          },
          {
            id: 'tube2',
            thematicId: 'them2',
            name: '@tube_two',
            competenceId: 'comp2',
            practicalTitle_i18n: {
              fr: 'tube2',
            },
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();

      // when
      const result = await findByTubeIds(['tube1', 'tube2']);

      // then
      expect(result).deepEqualInstance(
        new LearningContentView({
          frameworkViews: [
            new FrameworkView({
              id: 'framework1',
              name: 'FrameWork1',
              areaViews: [
                new AreaView({
                  id: 'area1',
                  title_i18n: { fr: 'area1' },
                  code: '1',
                  color: 'red',
                  competenceViews: [
                    new CompetenceView({
                      id: 'comp1',
                      name_i18n: { fr: 'comp1' },
                      index: '1.1',
                      thematicViews: [
                        new ThematicView({
                          id: 'them1',
                          index: 1,
                          name_i18n: { fr: 'them1' },
                          tubeViews: [
                            new TubeView({
                              id: 'tube1',
                              name: '@tube_one',
                              practicalTitle_i18n: { fr: 'tube1' },
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new FrameworkView({
              id: 'framework2',
              name: 'FrameWork2',
              areaViews: [
                new AreaView({
                  id: 'area2',
                  title_i18n: { fr: 'area2' },
                  code: '18',
                  color: 'green',
                  competenceViews: [
                    new CompetenceView({
                      id: 'comp2',
                      name_i18n: { fr: 'comp2' },
                      index: '18.1',
                      thematicViews: [
                        new ThematicView({
                          id: 'them2',
                          index: 18,
                          name_i18n: { fr: 'them2' },
                          tubeViews: [
                            new TubeView({
                              id: 'tube2',
                              name: '@tube_two',
                              practicalTitle_i18n: { fr: 'tube2' },
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      );
    });
  });
});
