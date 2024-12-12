import { tubeRepository } from '../../../../../src/learning-content/infrastructure/repositories/tube-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Tube', function () {
  afterEach(async function () {
    await knex('learningcontent.tubes').truncate();
  });

  describe('#save', function () {
    it('should insert tubes', async function () {
      // given
      const tubeDtos = [
        {
          id: 'tubeIdA',
          name: 'name Tube A',
          title: 'title Tube A',
          description: 'description Tube A',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube A', en: 'practicalTitle EN Tube A' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube A', en: 'practicalDescription EN Tube A' },
          competenceId: 'competenceId Tube A',
          thematicId: 'thematicId Tube A',
          skillIds: ['skillId Tube A'],
          isMobileCompliant: true,
          isTabletCompliant: true,
        },
        {
          id: 'tubeIdB',
          name: 'name Tube B',
          title: 'title Tube B',
          description: 'description Tube B',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube B', nl: 'practicalTitle NL Tube B' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube B', en: 'practicalDescription EN Tube B' },
          competenceId: 'competenceId Tube B',
          thematicId: 'thematicId Tube B',
          skillIds: [],
          isMobileCompliant: false,
          isTabletCompliant: false,
        },
        {
          id: 'tubeIdC',
          name: 'name Tube C',
          title: 'title TubeC',
          description: 'description Tube C',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube C' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube C', en: 'practicalDescription EN Tube C' },
          competenceId: 'competenceId Tube C',
          thematicId: 'thematicId Tube C',
          skillIds: ['skillId1 Tube C', 'skillId2 Tube C'],
          isMobileCompliant: true,
          isTabletCompliant: false,
        },
      ];

      // when
      await tubeRepository.save(tubeDtos);

      // then
      const savedTubes = await knex.select('*').from('learningcontent.tubes').orderBy('id');

      expect(savedTubes).to.deep.equal([
        {
          id: 'tubeIdA',
          name: 'name Tube A',
          title: 'title Tube A',
          description: 'description Tube A',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube A', en: 'practicalTitle EN Tube A' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube A', en: 'practicalDescription EN Tube A' },
          competenceId: 'competenceId Tube A',
          thematicId: 'thematicId Tube A',
          skillIds: ['skillId Tube A'],
          isMobileCompliant: true,
          isTabletCompliant: true,
        },
        {
          id: 'tubeIdB',
          name: 'name Tube B',
          title: 'title Tube B',
          description: 'description Tube B',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube B', nl: 'practicalTitle NL Tube B' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube B', en: 'practicalDescription EN Tube B' },
          competenceId: 'competenceId Tube B',
          thematicId: 'thematicId Tube B',
          skillIds: [],
          isMobileCompliant: false,
          isTabletCompliant: false,
        },
        {
          id: 'tubeIdC',
          name: 'name Tube C',
          title: 'title TubeC',
          description: 'description Tube C',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube C' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube C', en: 'practicalDescription EN Tube C' },
          competenceId: 'competenceId Tube C',
          thematicId: 'thematicId Tube C',
          skillIds: ['skillId1 Tube C', 'skillId2 Tube C'],
          isMobileCompliant: true,
          isTabletCompliant: false,
        },
      ]);
    });

    describe('when some tubes already exist', function () {
      it('should upsert tubes and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildTube({
          id: 'tubeIdA',
          name: 'name Tube A',
          title: 'title Tube A',
          description: 'description Tube A',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube A', en: 'practicalTitle EN Tube A' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube A', en: 'practicalDescription EN Tube A' },
          competenceId: 'competenceId Tube A',
          thematicId: 'thematicId Tube A',
          skillIds: ['skillId Tube A'],
          isMobileCompliant: true,
          isTabletCompliant: true,
        });
        databaseBuilder.factory.learningContent.buildTube({
          id: 'tubeIdB',
          name: 'name Tube B',
          title: 'title Tube B',
          description: 'description Tube B',
          practicalTitle_i18n: { fr: 'practicalTitle FR Tube B', nl: 'practicalTitle NL Tube B' },
          practicalDescription_i18n: { fr: 'practicalDescription FR Tube B', en: 'practicalDescription EN Tube B' },
          competenceId: 'competenceId Tube B',
          thematicId: 'thematicId Tube B',
          skillIds: [],
          isMobileCompliant: false,
          isTabletCompliant: false,
        });
        await databaseBuilder.commit();

        const tubeDtos = [
          {
            id: 'tubeIdA',
            name: 'name Tube A modified',
            title: 'title Tube A modified',
            description: 'description Tube A modified',
            practicalTitle_i18n: { fr: 'practicalTitle FR Tube A modified', nl: 'practicalTitle NL Tube A modified' },
            practicalDescription_i18n: {
              fr: 'practicalDescription FR Tube A modified',
              en: 'practicalDescription EN Tube A modified',
            },
            competenceId: 'competenceId Tube A modified',
            thematicId: 'thematicId Tube A modified',
            skillIds: ['skillId1 Tube A', 'skillId2 Tube A'],
            isMobileCompliant: false,
            isTabletCompliant: false,
          },
          {
            id: 'tubeIdC',
            name: 'name Tube C',
            title: 'title TubeC',
            description: 'description Tube C',
            practicalTitle_i18n: { fr: 'practicalTitle FR Tube C' },
            practicalDescription_i18n: { fr: 'practicalDescription FR Tube C', en: 'practicalDescription EN Tube C' },
            competenceId: 'competenceId Tube C',
            thematicId: 'thematicId Tube C',
            skillIds: ['skillId1 Tube C', 'skillId2 Tube C'],
            isMobileCompliant: true,
            isTabletCompliant: false,
          },
        ];

        // when
        await tubeRepository.save(tubeDtos);

        // then
        const savedTubes = await knex.select('*').from('learningcontent.tubes').orderBy('id');

        expect(savedTubes).to.deep.equal([
          {
            id: 'tubeIdA',
            name: 'name Tube A modified',
            title: 'title Tube A modified',
            description: 'description Tube A modified',
            practicalTitle_i18n: { fr: 'practicalTitle FR Tube A modified', nl: 'practicalTitle NL Tube A modified' },
            practicalDescription_i18n: {
              fr: 'practicalDescription FR Tube A modified',
              en: 'practicalDescription EN Tube A modified',
            },
            competenceId: 'competenceId Tube A modified',
            thematicId: 'thematicId Tube A modified',
            skillIds: ['skillId1 Tube A', 'skillId2 Tube A'],
            isMobileCompliant: false,
            isTabletCompliant: false,
          },
          {
            id: 'tubeIdB',
            name: 'name Tube B',
            title: 'title Tube B',
            description: 'description Tube B',
            practicalTitle_i18n: { fr: 'practicalTitle FR Tube B', nl: 'practicalTitle NL Tube B' },
            practicalDescription_i18n: { fr: 'practicalDescription FR Tube B', en: 'practicalDescription EN Tube B' },
            competenceId: 'competenceId Tube B',
            thematicId: 'thematicId Tube B',
            skillIds: [],
            isMobileCompliant: false,
            isTabletCompliant: false,
          },
          {
            id: 'tubeIdC',
            name: 'name Tube C',
            title: 'title TubeC',
            description: 'description Tube C',
            practicalTitle_i18n: { fr: 'practicalTitle FR Tube C' },
            practicalDescription_i18n: { fr: 'practicalDescription FR Tube C', en: 'practicalDescription EN Tube C' },
            competenceId: 'competenceId Tube C',
            thematicId: 'thematicId Tube C',
            skillIds: ['skillId1 Tube C', 'skillId2 Tube C'],
            isMobileCompliant: true,
            isTabletCompliant: false,
          },
        ]);
      });
    });
  });
});
