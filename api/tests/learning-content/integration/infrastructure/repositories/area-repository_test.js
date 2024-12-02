import { areaRepository } from '../../../../../src/learning-content/infrastructure/repositories/area-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Area', function () {
  afterEach(async function () {
    await knex('learningcontent.areas').truncate();
  });

  describe('#saveMany', function () {
    it('should insert areas', async function () {
      // given
      const areaDtos = [
        {
          id: 'areaA',
          name: 'name Domaine A',
          code: 'code Domaine A',
          title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
          color: 'color Domaine A',
          frameworkId: 'frameworkId Domaine A',
          competenceIds: ['competenceId1 Domaine A'],
        },
        {
          id: 'areaB',
          name: 'name Domaine B',
          code: 'code Domaine B',
          title_i18n: { fr: 'title_i18n FR Domaine B', nl: 'title_i18n NL Domaine B' },
          color: 'color Domaine B',
          frameworkId: 'frameworkId Domaine B',
          competenceIds: [],
        },
        {
          id: 'areaC',
          name: 'name Domaine C',
          code: 'code Domaine C',
          title_i18n: { fr: 'title_i18n FR Domaine C', nl: 'title_i18n NL Domaine C' },
          color: 'color Domaine C',
          frameworkId: 'frameworkId Domaine C',
          competenceIds: ['competenceId1 Domaine C', 'competenceId2 Domaine C'],
        },
      ];

      // when
      await areaRepository.saveMany(areaDtos);

      // then
      const savedAreas = await knex.select('*').from('learningcontent.areas').orderBy('name');

      expect(savedAreas).to.deep.equal([
        {
          id: 'areaA',
          name: 'name Domaine A',
          code: 'code Domaine A',
          title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
          color: 'color Domaine A',
          frameworkId: 'frameworkId Domaine A',
          competenceIds: ['competenceId1 Domaine A'],
        },
        {
          id: 'areaB',
          name: 'name Domaine B',
          code: 'code Domaine B',
          title_i18n: { fr: 'title_i18n FR Domaine B', nl: 'title_i18n NL Domaine B' },
          color: 'color Domaine B',
          frameworkId: 'frameworkId Domaine B',
          competenceIds: [],
        },
        {
          id: 'areaC',
          name: 'name Domaine C',
          code: 'code Domaine C',
          title_i18n: { fr: 'title_i18n FR Domaine C', nl: 'title_i18n NL Domaine C' },
          color: 'color Domaine C',
          frameworkId: 'frameworkId Domaine C',
          competenceIds: ['competenceId1 Domaine C', 'competenceId2 Domaine C'],
        },
      ]);
    });

    describe('when some areas already exist', function () {
      it('should upsert areas and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildArea({
          id: 'areaA',
          name: 'name Domaine A',
          code: 'code Domaine A',
          title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
          color: 'color Domaine A',
          frameworkId: 'frameworkId Domaine A',
          competenceIds: ['competenceId1 Domaine A'],
        });
        databaseBuilder.factory.learningContent.buildArea({
          id: 'areaB',
          name: 'name Domaine B',
          code: 'code Domaine B',
          title_i18n: { fr: 'title_i18n FR Domaine B', nl: 'title_i18n NL Domaine B' },
          color: 'color Domaine B',
          frameworkId: 'frameworkId Domaine B',
          competenceIds: [],
        });
        await databaseBuilder.commit();

        const areaDtos = [
          {
            id: 'areaA',
            name: 'name Domaine A modified',
            code: 'code Domaine A modified',
            title_i18n: {
              fr: 'title_i18n FR Domaine A modified',
              en: 'title_i18n EN Domaine A modified',
              nl: 'title_i18n NL Domaine A modified',
            },
            color: 'color Domaine A modified',
            frameworkId: 'frameworkId Domaine A modified',
            competenceIds: ['competenceId1 Domaine A modified', 'competenceId2 Domaine A modified'],
          },
          {
            id: 'areaC',
            name: 'name Domaine C',
            code: 'code Domaine C',
            title_i18n: { fr: 'title_i18n FR Domaine C', nl: 'title_i18n NL Domaine C' },
            color: 'color Domaine C',
            frameworkId: 'frameworkId Domaine C',
            competenceIds: ['competenceId1 Domaine C', 'competenceId2 Domaine C'],
          },
        ];

        // when
        await areaRepository.saveMany(areaDtos);

        // then
        const savedAreas = await knex.select('*').from('learningcontent.areas').orderBy('name');

        expect(savedAreas).to.deep.equal([
          {
            id: 'areaA',
            name: 'name Domaine A modified',
            code: 'code Domaine A modified',
            title_i18n: {
              fr: 'title_i18n FR Domaine A modified',
              en: 'title_i18n EN Domaine A modified',
              nl: 'title_i18n NL Domaine A modified',
            },
            color: 'color Domaine A modified',
            frameworkId: 'frameworkId Domaine A modified',
            competenceIds: ['competenceId1 Domaine A modified', 'competenceId2 Domaine A modified'],
          },
          {
            id: 'areaB',
            name: 'name Domaine B',
            code: 'code Domaine B',
            title_i18n: { fr: 'title_i18n FR Domaine B', nl: 'title_i18n NL Domaine B' },
            color: 'color Domaine B',
            frameworkId: 'frameworkId Domaine B',
            competenceIds: [],
          },
          {
            id: 'areaC',
            name: 'name Domaine C',
            code: 'code Domaine C',
            title_i18n: { fr: 'title_i18n FR Domaine C', nl: 'title_i18n NL Domaine C' },
            color: 'color Domaine C',
            frameworkId: 'frameworkId Domaine C',
            competenceIds: ['competenceId1 Domaine C', 'competenceId2 Domaine C'],
          },
        ]);
      });
    });
  });

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildArea({ id: 'areaIdB' });
      await databaseBuilder.commit();
    });

    it('should insert area when it does not exist in DB', async function () {
      // given
      const areaDto = {
        id: 'areaA',
        name: 'name Domaine A',
        code: 'code Domaine A',
        title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
        color: 'color Domaine A',
        frameworkId: 'frameworkId Domaine A',
        competenceIds: ['competenceId1 Domaine A'],
      };

      // when
      await areaRepository.save(areaDto);

      // then
      const savedArea = await knex.select('*').from('learningcontent.areas').where({ id: areaDto.id }).first();
      const [{ count }] = await knex('learningcontent.areas').count();
      expect(count).to.equal(2);
      expect(savedArea).to.deep.equal({
        id: 'areaA',
        name: 'name Domaine A',
        code: 'code Domaine A',
        title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
        color: 'color Domaine A',
        frameworkId: 'frameworkId Domaine A',
        competenceIds: ['competenceId1 Domaine A'],
      });
    });

    it('should update area when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildArea({
        id: 'areaA',
        name: 'name Domaine A',
        code: 'code Domaine A',
        title_i18n: { fr: 'title_i18n FR Domaine A', en: 'title_i18n EN Domaine A' },
        color: 'color Domaine A',
        frameworkId: 'frameworkId Domaine A',
        competenceIds: ['competenceId1 Domaine A'],
      });
      await databaseBuilder.commit();
      const areaDto = {
        id: 'areaA',
        name: 'name Domaine A modified',
        code: 'code Domaine A modified',
        title_i18n: {
          fr: 'title_i18n FR Domaine A modified',
          en: 'title_i18n EN Domaine A modified',
          nl: 'title_i18n NL Domaine A modified',
        },
        color: 'color Domaine A modified',
        frameworkId: 'frameworkId Domaine A modified',
        competenceIds: ['competenceId1 Domaine A modified', 'competenceId2 Domaine A modified'],
      };

      // when
      await areaRepository.save(areaDto);

      // then
      const savedArea = await knex.select('*').from('learningcontent.areas').where({ id: areaDto.id }).first();
      const [{ count }] = await knex('learningcontent.areas').count();
      expect(count).to.equal(2);
      expect(savedArea).to.deep.equal({
        id: 'areaA',
        name: 'name Domaine A modified',
        code: 'code Domaine A modified',
        title_i18n: {
          fr: 'title_i18n FR Domaine A modified',
          en: 'title_i18n EN Domaine A modified',
          nl: 'title_i18n NL Domaine A modified',
        },
        color: 'color Domaine A modified',
        frameworkId: 'frameworkId Domaine A modified',
        competenceIds: ['competenceId1 Domaine A modified', 'competenceId2 Domaine A modified'],
      });
    });
  });
});
