import { thematicRepository } from '../../../../../src/learning-content/infrastructure/repositories/thematic-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Thematic', function () {
  afterEach(async function () {
    await knex('learningcontent.thematics').truncate();
  });

  describe('#save', function () {
    it('should insert thematics', async function () {
      // given
      const thematicDtos = [
        {
          id: 'thematicA',
          name_i18n: { fr: 'name_i18n FR Thématique A', en: 'name_i18n EN Thématique A' },
          index: 1,
          competenceId: 'competenceId Thématique A',
          tubeIds: ['tubeId1 Thématique A'],
        },
        {
          id: 'thematicB',
          name_i18n: { fr: 'name_i18n FR Thématique B', en: 'name_i18n EN Thématique B' },
          index: 2,
          competenceId: 'competenceId Thématique B',
          tubeIds: [],
        },
        {
          id: 'thematicC',
          name_i18n: { fr: 'name_i18n FR Thématique C', nl: 'name_i18n NL Thématique C' },
          index: 5,
          competenceId: 'competenceId Thématique C',
          tubeIds: ['tubeId1 Thématique C', 'tubeId2 Thématique C'],
        },
      ];

      // when
      await thematicRepository.save(thematicDtos);

      // then
      const savedThematics = await knex.select('*').from('learningcontent.thematics').orderBy('id');

      expect(savedThematics).to.deep.equal([
        {
          id: 'thematicA',
          name_i18n: { fr: 'name_i18n FR Thématique A', en: 'name_i18n EN Thématique A' },
          index: 1,
          competenceId: 'competenceId Thématique A',
          tubeIds: ['tubeId1 Thématique A'],
        },
        {
          id: 'thematicB',
          name_i18n: { fr: 'name_i18n FR Thématique B', en: 'name_i18n EN Thématique B' },
          index: 2,
          competenceId: 'competenceId Thématique B',
          tubeIds: [],
        },
        {
          id: 'thematicC',
          name_i18n: { fr: 'name_i18n FR Thématique C', nl: 'name_i18n NL Thématique C' },
          index: 5,
          competenceId: 'competenceId Thématique C',
          tubeIds: ['tubeId1 Thématique C', 'tubeId2 Thématique C'],
        },
      ]);
    });

    describe('when some thematics already exist', function () {
      it('should upsert thematics and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildThematic({
          id: 'thematicA',
          name_i18n: { fr: 'name_i18n FR Thématique A', en: 'name_i18n EN Thématique A' },
          index: 1,
          competenceId: 'competenceId Thématique A',
          tubeIds: ['tubeId1 Thématique A'],
        });
        databaseBuilder.factory.learningContent.buildThematic({
          id: 'thematicB',
          name_i18n: { fr: 'name_i18n FR Thématique B', en: 'name_i18n EN Thématique B' },
          index: 2,
          competenceId: 'competenceId Thématique B',
          tubeIds: [],
        });
        await databaseBuilder.commit();

        const thematicDtos = [
          {
            id: 'thematicA',
            name_i18n: {
              fr: 'name_i18n FR Thématique A modified',
              en: 'name_i18n EN Thématique A',
              nl: 'name_i18n NL Thématique A modified',
            },
            index: 4,
            competenceId: 'competenceId Thématique A modified',
            tubeIds: ['tubeId1 Thématique A modified', 'tubeId3 Thématique A modified'],
          },
          {
            id: 'thematicC',
            name_i18n: { fr: 'name_i18n FR Thématique C', nl: 'name_i18n NL Thématique C' },
            index: 5,
            competenceId: 'competenceId Thématique C',
            tubeIds: ['tubeId1 Thématique C', 'tubeId2 Thématique C'],
          },
        ];

        // when
        await thematicRepository.save(thematicDtos);

        // then
        const savedThematics = await knex.select('*').from('learningcontent.thematics').orderBy('id');

        expect(savedThematics).to.deep.equal([
          {
            id: 'thematicA',
            name_i18n: {
              fr: 'name_i18n FR Thématique A modified',
              en: 'name_i18n EN Thématique A',
              nl: 'name_i18n NL Thématique A modified',
            },
            index: 4,
            competenceId: 'competenceId Thématique A modified',
            tubeIds: ['tubeId1 Thématique A modified', 'tubeId3 Thématique A modified'],
          },
          {
            id: 'thematicB',
            name_i18n: { fr: 'name_i18n FR Thématique B', en: 'name_i18n EN Thématique B' },
            index: 2,
            competenceId: 'competenceId Thématique B',
            tubeIds: [],
          },
          {
            id: 'thematicC',
            name_i18n: { fr: 'name_i18n FR Thématique C', nl: 'name_i18n NL Thématique C' },
            index: 5,
            competenceId: 'competenceId Thématique C',
            tubeIds: ['tubeId1 Thématique C', 'tubeId2 Thématique C'],
          },
        ]);
      });
    });
  });
});
