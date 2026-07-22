import { findByTubeIds, NoTubesProvidedError, SomeTubesNotFoundError } from '../../../../../src/learning-content/application/api/learning-content-api.js';
import { LearningContentDTO } from '../../../../../src/learning-content/application/api/models/LearningContentDTO.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Learning Content | Integration | Application | API | LearningContent', function () {
  describe('#findByTubeIds', function () {
    beforeEach(function () {
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
            title_i18n: { fr: 'area2', en: 'area2 EN' },
            code: '18',
            color: 'green',
            frameworkId: 'framework2',
            competenceIds: ['comp2'],
          },
        ],
        competences: [
          { id: 'comp1', areaId: 'area1', index: '1.1', name_i18n: { fr: 'comp1' } },
          { id: 'comp2', areaId: 'area2', index: '18.1', name_i18n: { fr: 'comp2', en: 'comp2 EN' } },
        ],
        thematics: [
          { id: 'them1', competenceId: 'comp1', index: 1, name_i18n: { fr: 'them1' } },
          { id: 'them2', competenceId: 'comp2', index: 18, name_i18n: { fr: 'them2', en: 'them2 EN' } },
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
              en: 'tube2 EN',
            },
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);
      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('learningcontent.frameworks').truncate();
      await knex('learningcontent.areas').truncate();
      await knex('learningcontent.competences').truncate();
      await knex('learningcontent.thematics').truncate();
      await knex('learningcontent.tubes').truncate();
    });

    context('success', function () {
      it('returns a LearningContentResult with the expected info', async function () {
        // when
        const learningContentResult = await findByTubeIds({ tubeIds: ['tube1', 'tube2'], locale: 'en' });

        // then
        expect(learningContentResult.learningContentDTO).deepEqualInstance(
          new LearningContentDTO({
            frameworkDTOs: [
              {
                id: 'framework1',
                name: 'FrameWork1',
                areaDTOs: [
                  {
                    id: 'area1',
                    title: 'area1',
                    code: '1',
                    color: 'red',
                    competenceDTOs: [
                      {
                        id: 'comp1',
                        name: 'comp1',
                        index: '1.1',
                        thematicDTOs: [
                          {
                            id: 'them1',
                            index: 1,
                            name: 'them1',
                            tubeDTOs: [
                              {
                                id: 'tube1',
                                name: '@tube_one',
                                practicalTitle: 'tube1',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'framework2',
                name: 'FrameWork2',
                areaDTOs: [
                  {
                    id: 'area2',
                    title: 'area2 EN',
                    code: '18',
                    color: 'green',
                    competenceDTOs: [
                      {
                        id: 'comp2',
                        name: 'comp2 EN',
                        index: '18.1',
                        thematicDTOs: [
                          {
                            id: 'them2',
                            index: 18,
                            name: 'them2 EN',
                            tubeDTOs: [
                              {
                                id: 'tube2',
                                name: '@tube_two',
                                practicalTitle: 'tube2 EN',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        );
        expect(learningContentResult.error).to.be.null;
      });

      it('returns a LearningContentResult with the expected info with default FR when no locale provided', async function () {
        // when
        const learningContentResult = await findByTubeIds({ tubeIds: ['tube1', 'tube2'] });

        // then
        expect(learningContentResult.learningContentDTO).deepEqualInstance(
          new LearningContentDTO({
            frameworkDTOs: [
              {
                id: 'framework1',
                name: 'FrameWork1',
                areaDTOs: [
                  {
                    id: 'area1',
                    title: 'area1',
                    code: '1',
                    color: 'red',
                    competenceDTOs: [
                      {
                        id: 'comp1',
                        name: 'comp1',
                        index: '1.1',
                        thematicDTOs: [
                          {
                            id: 'them1',
                            index: 1,
                            name: 'them1',
                            tubeDTOs: [
                              {
                                id: 'tube1',
                                name: '@tube_one',
                                practicalTitle: 'tube1',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'framework2',
                name: 'FrameWork2',
                areaDTOs: [
                  {
                    id: 'area2',
                    title: 'area2',
                    code: '18',
                    color: 'green',
                    competenceDTOs: [
                      {
                        id: 'comp2',
                        name: 'comp2',
                        index: '18.1',
                        thematicDTOs: [
                          {
                            id: 'them2',
                            index: 18,
                            name: 'them2',
                            tubeDTOs: [
                              {
                                id: 'tube2',
                                name: '@tube_two',
                                practicalTitle: 'tube2',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        );
        expect(learningContentResult.error).to.be.null;
      });
    });

    context('failure', function () {
      it('returns an empty learning content along with error message when no tube IDS provided', async function () {
        // when
        const learningContentResult = await findByTubeIds({ tubeIds: null, locale: 'en' });

        // then
        expect(learningContentResult.learningContentDTO).to.be.null;
        expect(learningContentResult.error).deepEqualInstance(new NoTubesProvidedError());
      });

      it('returns a partial learning content along with error message when some tube do not exist', async function () {
        // when
        const learningContentResult = await findByTubeIds({ tubeIds: ['tubeA', 'tube2'], locale: 'en' });

        // then
        expect(learningContentResult.learningContentDTO).deepEqualInstance(
          new LearningContentDTO({
            frameworkDTOs: [
              {
                id: 'framework2',
                name: 'FrameWork2',
                areaDTOs: [
                  {
                    id: 'area2',
                    title: 'area2 EN',
                    code: '18',
                    color: 'green',
                    competenceDTOs: [
                      {
                        id: 'comp2',
                        name: 'comp2 EN',
                        index: '18.1',
                        thematicDTOs: [
                          {
                            id: 'them2',
                            index: 18,
                            name: 'them2 EN',
                            tubeDTOs: [
                              {
                                id: 'tube2',
                                name: '@tube_two',
                                practicalTitle: 'tube2 EN',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        );
        expect(learningContentResult.error).deepEqualInstance(new SomeTubesNotFoundError(['tubeA']));
      });
    });
  });
});
