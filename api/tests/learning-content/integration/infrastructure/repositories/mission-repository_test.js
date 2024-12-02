import { missionRepository } from '../../../../../src/learning-content/infrastructure/repositories/mission-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Mission', function () {
  afterEach(async function () {
    await knex('learningcontent.missions').truncate();
  });

  describe('#saveMany', function () {
    it('should insert missions', async function () {
      // given
      const missionDtos = [
        {
          id: 1,
          status: 'status Mission A',
          name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
          content: { some: 'content' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
          introductionMediaType: 'introductionMediaType Mission A',
          introductionMediaUrl: 'introductionMediaUrl Mission A',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission A',
            en: 'introductionMediaAlt EN Mission A',
          },
          documentationUrl: 'documentationUrl Mission A',
          cardImageUrl: 'cardImageUrl Mission A',
          competenceId: 'competenceIdA',
        },
        {
          id: 2,
          status: 'status Mission B',
          name_i18n: { fr: 'name FR Mission B', nl: 'name EN Mission B' },
          content: { some: 'contentB' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission B', en: 'learningObjectives EN Mission B' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission B', en: 'validatedObjectives EN Mission B' },
          introductionMediaType: 'introductionMediaType Mission B',
          introductionMediaUrl: 'introductionMediaUrl Mission B',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission B',
            en: 'introductionMediaAlt EN Mission B',
          },
          documentationUrl: 'documentationUrl Mission B',
          cardImageUrl: 'cardImageUrl Mission B',
          competenceId: 'competenceIdB',
        },
        {
          id: 3,
          status: 'status Mission C',
          name_i18n: { fr: 'name FR Mission C', nl: 'name EN Mission C' },
          content: { some: 'contentC' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission C', en: 'learningObjectives EN Mission C' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission C', en: 'validatedObjectives EN Mission C' },
          introductionMediaType: 'introductionMediaType Mission C',
          introductionMediaUrl: 'introductionMediaUrl Mission C',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission C',
            en: 'introductionMediaAlt EN Mission C',
          },
          documentationUrl: 'documentationUrl Mission C',
          cardImageUrl: 'cardImageUrl Mission C',
          competenceId: 'competenceIdC',
        },
      ];

      // when
      await missionRepository.saveMany(missionDtos);

      // then
      const savedMissions = await knex.select('*').from('learningcontent.missions').orderBy('id');

      expect(savedMissions).to.deep.equal([
        {
          id: 1,
          status: 'status Mission A',
          name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
          content: { some: 'content' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
          introductionMediaType: 'introductionMediaType Mission A',
          introductionMediaUrl: 'introductionMediaUrl Mission A',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission A',
            en: 'introductionMediaAlt EN Mission A',
          },
          documentationUrl: 'documentationUrl Mission A',
          cardImageUrl: 'cardImageUrl Mission A',
          competenceId: 'competenceIdA',
        },
        {
          id: 2,
          status: 'status Mission B',
          name_i18n: { fr: 'name FR Mission B', nl: 'name EN Mission B' },
          content: { some: 'contentB' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission B', en: 'learningObjectives EN Mission B' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission B', en: 'validatedObjectives EN Mission B' },
          introductionMediaType: 'introductionMediaType Mission B',
          introductionMediaUrl: 'introductionMediaUrl Mission B',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission B',
            en: 'introductionMediaAlt EN Mission B',
          },
          documentationUrl: 'documentationUrl Mission B',
          cardImageUrl: 'cardImageUrl Mission B',
          competenceId: 'competenceIdB',
        },
        {
          id: 3,
          status: 'status Mission C',
          name_i18n: { fr: 'name FR Mission C', nl: 'name EN Mission C' },
          content: { some: 'contentC' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission C', en: 'learningObjectives EN Mission C' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission C', en: 'validatedObjectives EN Mission C' },
          introductionMediaType: 'introductionMediaType Mission C',
          introductionMediaUrl: 'introductionMediaUrl Mission C',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission C',
            en: 'introductionMediaAlt EN Mission C',
          },
          documentationUrl: 'documentationUrl Mission C',
          cardImageUrl: 'cardImageUrl Mission C',
          competenceId: 'competenceIdC',
        },
      ]);
    });

    describe('when some missions already exist', function () {
      it('should upsert missions and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildMission({
          id: 1,
          status: 'status Mission A',
          name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
          content: { some: 'content' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
          introductionMediaType: 'introductionMediaType Mission A',
          introductionMediaUrl: 'introductionMediaUrl Mission A',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission A',
            en: 'introductionMediaAlt EN Mission A',
          },
          documentationUrl: 'documentationUrl Mission A',
          cardImageUrl: 'cardImageUrl Mission A',
          competenceId: 'competenceIdA',
        });
        databaseBuilder.factory.learningContent.buildMission({
          id: 2,
          status: 'status Mission B',
          name_i18n: { fr: 'name FR Mission B', nl: 'name EN Mission B' },
          content: { some: 'contentB' },
          learningObjectives_i18n: { fr: 'learningObjectives FR Mission B', en: 'learningObjectives EN Mission B' },
          validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission B', en: 'validatedObjectives EN Mission B' },
          introductionMediaType: 'introductionMediaType Mission B',
          introductionMediaUrl: 'introductionMediaUrl Mission B',
          introductionMediaAlt_i18n: {
            fr: 'introductionMediaAlt FR Mission B',
            en: 'introductionMediaAlt EN Mission B',
          },
          documentationUrl: 'documentationUrl Mission B',
          cardImageUrl: 'cardImageUrl Mission B',
          competenceId: 'competenceIdB',
        });
        await databaseBuilder.commit();

        const missionDtos = [
          {
            id: 1,
            status: 'status Mission A modified',
            name_i18n: { fr: 'name FR Mission A modified', en: 'name EN Mission A modified' },
            content: { some: 'content' },
            learningObjectives_i18n: {
              fr: 'learningObjectives FR Mission A modified',
              nl: 'learningObjectives EN Mission A modified',
            },
            validatedObjectives_i18n: {
              fr: 'validatedObjectives FR Mission A modified',
            },
            introductionMediaType: 'introductionMediaType Mission A modified',
            introductionMediaUrl: 'introductionMediaUrl Mission A modified',
            introductionMediaAlt_i18n: {
              en: 'introductionMediaAlt EN Mission A modified',
            },
            documentationUrl: 'documentationUrl Mission A modified',
            cardImageUrl: 'cardImageUrl Mission A modified',
            competenceId: 'competenceIdA modified',
          },
          {
            id: 3,
            status: 'status Mission C',
            name_i18n: { fr: 'name FR Mission C', nl: 'name EN Mission C' },
            content: { some: 'contentC' },
            learningObjectives_i18n: { fr: 'learningObjectives FR Mission C', en: 'learningObjectives EN Mission C' },
            validatedObjectives_i18n: {
              fr: 'validatedObjectives FR Mission C',
              en: 'validatedObjectives EN Mission C',
            },
            introductionMediaType: 'introductionMediaType Mission C',
            introductionMediaUrl: 'introductionMediaUrl Mission C',
            introductionMediaAlt_i18n: {
              fr: 'introductionMediaAlt FR Mission C',
              en: 'introductionMediaAlt EN Mission C',
            },
            documentationUrl: 'documentationUrl Mission C',
            cardImageUrl: 'cardImageUrl Mission C',
            competenceId: 'competenceIdC',
          },
        ];

        // when
        await missionRepository.saveMany(missionDtos);

        // then
        const savedMissions = await knex.select('*').from('learningcontent.missions').orderBy('id');

        expect(savedMissions).to.deep.equal([
          {
            id: 1,
            status: 'status Mission A modified',
            name_i18n: { fr: 'name FR Mission A modified', en: 'name EN Mission A modified' },
            content: { some: 'content' },
            learningObjectives_i18n: {
              fr: 'learningObjectives FR Mission A modified',
              nl: 'learningObjectives EN Mission A modified',
            },
            validatedObjectives_i18n: {
              fr: 'validatedObjectives FR Mission A modified',
            },
            introductionMediaType: 'introductionMediaType Mission A modified',
            introductionMediaUrl: 'introductionMediaUrl Mission A modified',
            introductionMediaAlt_i18n: {
              en: 'introductionMediaAlt EN Mission A modified',
            },
            documentationUrl: 'documentationUrl Mission A modified',
            cardImageUrl: 'cardImageUrl Mission A modified',
            competenceId: 'competenceIdA modified',
          },
          {
            id: 2,
            status: 'status Mission B',
            name_i18n: { fr: 'name FR Mission B', nl: 'name EN Mission B' },
            content: { some: 'contentB' },
            learningObjectives_i18n: { fr: 'learningObjectives FR Mission B', en: 'learningObjectives EN Mission B' },
            validatedObjectives_i18n: {
              fr: 'validatedObjectives FR Mission B',
              en: 'validatedObjectives EN Mission B',
            },
            introductionMediaType: 'introductionMediaType Mission B',
            introductionMediaUrl: 'introductionMediaUrl Mission B',
            introductionMediaAlt_i18n: {
              fr: 'introductionMediaAlt FR Mission B',
              en: 'introductionMediaAlt EN Mission B',
            },
            documentationUrl: 'documentationUrl Mission B',
            cardImageUrl: 'cardImageUrl Mission B',
            competenceId: 'competenceIdB',
          },
          {
            id: 3,
            status: 'status Mission C',
            name_i18n: { fr: 'name FR Mission C', nl: 'name EN Mission C' },
            content: { some: 'contentC' },
            learningObjectives_i18n: { fr: 'learningObjectives FR Mission C', en: 'learningObjectives EN Mission C' },
            validatedObjectives_i18n: {
              fr: 'validatedObjectives FR Mission C',
              en: 'validatedObjectives EN Mission C',
            },
            introductionMediaType: 'introductionMediaType Mission C',
            introductionMediaUrl: 'introductionMediaUrl Mission C',
            introductionMediaAlt_i18n: {
              fr: 'introductionMediaAlt FR Mission C',
              en: 'introductionMediaAlt EN Mission C',
            },
            documentationUrl: 'documentationUrl Mission C',
            cardImageUrl: 'cardImageUrl Mission C',
            competenceId: 'competenceIdC',
          },
        ]);
      });
    });
  });

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildMission({ id: 66 });
      await databaseBuilder.commit();
    });

    it('should insert mission when it does not exist in DB', async function () {
      // given
      const missionDto = {
        id: 1,
        status: 'status Mission A',
        name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
        content: { some: 'content' },
        learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
        validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
        introductionMediaType: 'introductionMediaType Mission A',
        introductionMediaUrl: 'introductionMediaUrl Mission A',
        introductionMediaAlt_i18n: {
          fr: 'introductionMediaAlt FR Mission A',
          en: 'introductionMediaAlt EN Mission A',
        },
        documentationUrl: 'documentationUrl Mission A',
        cardImageUrl: 'cardImageUrl Mission A',
        competenceId: 'competenceIdA',
      };

      // when
      await missionRepository.save(missionDto);

      // then
      const savedMission = await knex.select('*').from('learningcontent.missions').where({ id: missionDto.id }).first();
      const [{ count }] = await knex('learningcontent.missions').count();
      expect(count).to.equal(2);
      expect(savedMission).to.deep.equal({
        id: 1,
        status: 'status Mission A',
        name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
        content: { some: 'content' },
        learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
        validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
        introductionMediaType: 'introductionMediaType Mission A',
        introductionMediaUrl: 'introductionMediaUrl Mission A',
        introductionMediaAlt_i18n: {
          fr: 'introductionMediaAlt FR Mission A',
          en: 'introductionMediaAlt EN Mission A',
        },
        documentationUrl: 'documentationUrl Mission A',
        cardImageUrl: 'cardImageUrl Mission A',
        competenceId: 'competenceIdA',
      });
    });

    it('should update mission when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildMission({
        id: 1,
        status: 'status Mission A',
        name_i18n: { fr: 'name FR Mission A', en: 'name EN Mission A' },
        content: { some: 'content' },
        learningObjectives_i18n: { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
        validatedObjectives_i18n: { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
        introductionMediaType: 'introductionMediaType Mission A',
        introductionMediaUrl: 'introductionMediaUrl Mission A',
        introductionMediaAlt_i18n: {
          fr: 'introductionMediaAlt FR Mission A',
          en: 'introductionMediaAlt EN Mission A',
        },
        documentationUrl: 'documentationUrl Mission A',
        cardImageUrl: 'cardImageUrl Mission A',
        competenceId: 'competenceIdA',
      });
      await databaseBuilder.commit();
      const missionDto = {
        id: 1,
        status: 'status Mission A modified',
        name_i18n: { fr: 'name FR Mission A modified', en: 'name EN Mission A modified' },
        content: { some: 'content' },
        learningObjectives_i18n: {
          fr: 'learningObjectives FR Mission A modified',
          nl: 'learningObjectives EN Mission A modified',
        },
        validatedObjectives_i18n: {
          fr: 'validatedObjectives FR Mission A modified',
        },
        introductionMediaType: 'introductionMediaType Mission A modified',
        introductionMediaUrl: 'introductionMediaUrl Mission A modified',
        introductionMediaAlt_i18n: {
          en: 'introductionMediaAlt EN Mission A modified',
        },
        documentationUrl: 'documentationUrl Mission A modified',
        cardImageUrl: 'cardImageUrl Mission A modified',
        competenceId: 'competenceIdA modified',
      };

      // when
      await missionRepository.save(missionDto);

      // then
      const savedMission = await knex.select('*').from('learningcontent.missions').where({ id: missionDto.id }).first();
      const [{ count }] = await knex('learningcontent.missions').count();
      expect(count).to.equal(2);
      expect(savedMission).to.deep.equal({
        id: 1,
        status: 'status Mission A modified',
        name_i18n: { fr: 'name FR Mission A modified', en: 'name EN Mission A modified' },
        content: { some: 'content' },
        learningObjectives_i18n: {
          fr: 'learningObjectives FR Mission A modified',
          nl: 'learningObjectives EN Mission A modified',
        },
        validatedObjectives_i18n: {
          fr: 'validatedObjectives FR Mission A modified',
        },
        introductionMediaType: 'introductionMediaType Mission A modified',
        introductionMediaUrl: 'introductionMediaUrl Mission A modified',
        introductionMediaAlt_i18n: {
          en: 'introductionMediaAlt EN Mission A modified',
        },
        documentationUrl: 'documentationUrl Mission A modified',
        cardImageUrl: 'cardImageUrl Mission A modified',
        competenceId: 'competenceIdA modified',
      });
    });
  });
});
