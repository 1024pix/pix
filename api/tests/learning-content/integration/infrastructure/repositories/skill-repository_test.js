import { skillRepository } from '../../../../../src/learning-content/infrastructure/repositories/skill-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Skill', function () {
  afterEach(async function () {
    await knex('learningcontent.skills').truncate();
  });

  describe('#saveMany', function () {
    it('should insert skills', async function () {
      // given
      const skillDtos = [
        {
          id: 'skill1',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          version: 1,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        },
        {
          id: 'skill1v2',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 2,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        },
        {
          id: 'skill2',
          name: '@cuiredespates3',
          hintStatus: 'validé',
          tutorialIds: ['tuto3'],
          learningMoreTutorialIds: ['tutoMore2', 'tutoMore3'],
          pixValue: 20000,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 1,
          level: 3,
          hint_i18n: {
            fr: 'Elle doivent être al dente',
            en: 'These need to be al dente',
            nl: 'Aflugeublik al dente',
          },
        },
      ];

      // when
      await skillRepository.saveMany(skillDtos);

      // then
      const savedSkills = await knex.select('*').from('learningcontent.skills').orderBy('name');

      expect(savedSkills).to.deep.equal([
        {
          id: 'skill1',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          version: 1,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        },
        {
          id: 'skill1v2',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 2,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        },
        {
          id: 'skill2',
          name: '@cuiredespates3',
          hintStatus: 'validé',
          tutorialIds: ['tuto3'],
          learningMoreTutorialIds: ['tutoMore2', 'tutoMore3'],
          pixValue: 20000,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 1,
          level: 3,
          hint_i18n: {
            fr: 'Elle doivent être al dente',
            en: 'These need to be al dente',
            nl: 'Aflugeublik al dente',
          },
        },
      ]);
    });

    context('when some skills already exist', function () {
      it('should upsert skills and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'skill1',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 1,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'skill2',
          name: '@cuiredespates3',
          hintStatus: 'validé',
          tutorialIds: [],
          learningMoreTutorialIds: [],
          pixValue: 0,
          competenceId: 'competence1',
          status: 'actif',
          tubeId: 'tube1',
          version: 1,
          level: 3,
          hint_i18n: {
            fr: 'Elle doivent être cuite à point',
            en: 'These need to be cuite à point',
            nl: 'Aflugeublik cuite à point',
          },
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'skillDinosaure',
          name: '@dinosaure1',
          hintStatus: 'validé',
          tutorialIds: ['tutoDino'],
          learningMoreTutorialIds: ['tutoMoreDino'],
          pixValue: 666,
          competenceId: 'competenceDino',
          status: 'actif',
          tubeId: 'tubeDino',
          version: 1,
          level: 1,
          hint_i18n: {
            fr: 'Dinosaure',
            en: 'Dinosaur',
            nl: 'Dinosaurus',
          },
        });

        const skillDtos = [
          {
            id: 'skill1',
            name: '@cuiredespates2',
            hintStatus: 'pré-validé',
            tutorialIds: ['tuto1', 'tuto2'],
            learningMoreTutorialIds: ['tutoMore1'],
            pixValue: 10000,
            competenceId: 'competence1',
            status: 'périmé',
            tubeId: 'tube1',
            version: 1,
            level: 2,
            hint_i18n: {
              fr: 'Il faut une casserolle d’eau chaude',
              en: 'A casserolle of hot water is needed',
              nl: 'Aflugeublik',
            },
          },
          {
            id: 'skill1v2',
            name: '@cuiredespates2',
            hintStatus: 'pré-validé',
            tutorialIds: ['tuto1', 'tuto2'],
            learningMoreTutorialIds: ['tutoMore1'],
            pixValue: 10000,
            competenceId: 'competence1',
            status: 'actif',
            tubeId: 'tube1',
            version: 2,
            level: 2,
            hint_i18n: {
              fr: 'Il faut une casserolle d’eau chaude',
              en: 'A casserolle of hot water is needed',
              nl: 'Aflugeublik',
            },
          },
          {
            id: 'skill2',
            name: '@cuiredespates3',
            hintStatus: 'validé',
            tutorialIds: ['tuto3'],
            learningMoreTutorialIds: ['tutoMore2', 'tutoMore3'],
            pixValue: 20000,
            competenceId: 'competence1',
            status: 'actif',
            tubeId: 'tube1',
            version: 1,
            level: 3,
            hint_i18n: {
              fr: 'Elle doivent être al dente',
              en: 'These need to be al dente',
              nl: 'Aflugeublik al dente',
            },
          },
        ];
        await databaseBuilder.commit();

        // when
        await skillRepository.saveMany(skillDtos);

        // then
        const savedSkills = await knex.select('*').from('learningcontent.skills').orderBy('name');

        expect(savedSkills).to.deep.equal([
          {
            id: 'skill1',
            name: '@cuiredespates2',
            hintStatus: 'pré-validé',
            tutorialIds: ['tuto1', 'tuto2'],
            learningMoreTutorialIds: ['tutoMore1'],
            pixValue: 10000,
            competenceId: 'competence1',
            status: 'périmé',
            tubeId: 'tube1',
            version: 1,
            level: 2,
            hint_i18n: {
              fr: 'Il faut une casserolle d’eau chaude',
              en: 'A casserolle of hot water is needed',
              nl: 'Aflugeublik',
            },
          },
          {
            id: 'skill1v2',
            name: '@cuiredespates2',
            hintStatus: 'pré-validé',
            tutorialIds: ['tuto1', 'tuto2'],
            learningMoreTutorialIds: ['tutoMore1'],
            pixValue: 10000,
            competenceId: 'competence1',
            status: 'actif',
            tubeId: 'tube1',
            version: 2,
            level: 2,
            hint_i18n: {
              fr: 'Il faut une casserolle d’eau chaude',
              en: 'A casserolle of hot water is needed',
              nl: 'Aflugeublik',
            },
          },
          {
            id: 'skill2',
            name: '@cuiredespates3',
            hintStatus: 'validé',
            tutorialIds: ['tuto3'],
            learningMoreTutorialIds: ['tutoMore2', 'tutoMore3'],
            pixValue: 20000,
            competenceId: 'competence1',
            status: 'actif',
            tubeId: 'tube1',
            version: 1,
            level: 3,
            hint_i18n: {
              fr: 'Elle doivent être al dente',
              en: 'These need to be al dente',
              nl: 'Aflugeublik al dente',
            },
          },
          {
            id: 'skillDinosaure',
            name: '@dinosaure1',
            hintStatus: 'validé',
            tutorialIds: ['tutoDino'],
            learningMoreTutorialIds: ['tutoMoreDino'],
            pixValue: 666,
            competenceId: 'competenceDino',
            status: 'actif',
            tubeId: 'tubeDino',
            version: 1,
            level: 1,
            hint_i18n: {
              fr: 'Dinosaure',
              en: 'Dinosaur',
              nl: 'Dinosaurus',
            },
          },
        ]);
      });
    });
  });

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildSkill({ id: 'skillIdB' });
      await databaseBuilder.commit();
    });

    it('should insert skill when it does not exist in DB', async function () {
      // given
      const skillDto = {
        id: 'skill1',
        name: '@cuiredespates2',
        hintStatus: 'pré-validé',
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tutoMore1'],
        pixValue: 10000,
        competenceId: 'competence1',
        status: 'actif',
        tubeId: 'tube1',
        version: 1,
        level: 2,
        hint_i18n: {
          fr: 'Il faut une casserolle d’eau chaude',
          en: 'A casserolle of hot water is needed',
          nl: 'Aflugeublik',
        },
      };

      // when
      await skillRepository.save(skillDto);

      // then
      const savedSkill = await knex.select('*').from('learningcontent.skills').where({ id: skillDto.id }).first();
      const [{ count }] = await knex('learningcontent.skills').count();
      expect(count).to.equal(2);
      expect(savedSkill).to.deep.equal({
        id: 'skill1',
        name: '@cuiredespates2',
        hintStatus: 'pré-validé',
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tutoMore1'],
        pixValue: 10000,
        competenceId: 'competence1',
        status: 'actif',
        tubeId: 'tube1',
        version: 1,
        level: 2,
        hint_i18n: {
          fr: 'Il faut une casserolle d’eau chaude',
          en: 'A casserolle of hot water is needed',
          nl: 'Aflugeublik',
        },
      });
    });

    it('should update skill when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skill1',
        name: '@cuiredespates2',
        hintStatus: 'pré-validé',
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tutoMore1'],
        pixValue: 10000,
        competenceId: 'competence1',
        status: 'actif',
        tubeId: 'tube1',
        version: 1,
        level: 2,
        hint_i18n: {
          fr: 'Il faut une casserolle d’eau chaude',
          en: 'A casserolle of hot water is needed',
          nl: 'Aflugeublik',
        },
      });
      await databaseBuilder.commit();
      const skillDto = {
        id: 'skill1',
        name: '@cuiredespates2',
        hintStatus: 'pré-validé',
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tutoMore1'],
        pixValue: 10000,
        competenceId: 'competence1',
        status: 'périmé',
        tubeId: 'tube1',
        version: 1,
        level: 2,
        hint_i18n: {
          fr: 'Il faut une casserolle d’eau chaude',
          en: 'A casserolle of hot water is needed',
          nl: 'Aflugeublik',
        },
      };

      // when
      await skillRepository.save(skillDto);

      // then
      const savedSkill = await knex.select('*').from('learningcontent.skills').where({ id: skillDto.id }).first();
      const [{ count }] = await knex('learningcontent.skills').count();
      expect(count).to.equal(2);
      expect(savedSkill).to.deep.equal({
        id: 'skill1',
        name: '@cuiredespates2',
        hintStatus: 'pré-validé',
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tutoMore1'],
        pixValue: 10000,
        competenceId: 'competence1',
        status: 'périmé',
        tubeId: 'tube1',
        version: 1,
        level: 2,
        hint_i18n: {
          fr: 'Il faut une casserolle d’eau chaude',
          en: 'A casserolle of hot water is needed',
          nl: 'Aflugeublik',
        },
      });
    });

    describe('when giving additionnal fields', function () {
      it('should ignore these', async function () {
        // given
        const skillDto = {
          id: 'skill1',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          version: 1,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
          // additionnal fields
          airtableId: 'recSkill1',
          foo: 'foo',
          bar: 'bar',
        };

        // when
        await skillRepository.save(skillDto);

        // then
        const savedSkill = await knex.select('*').from('learningcontent.skills').where({ id: skillDto.id }).first();

        expect(savedSkill).to.deep.equal({
          id: 'skill1',
          name: '@cuiredespates2',
          hintStatus: 'pré-validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tutoMore1'],
          pixValue: 10000,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          version: 1,
          level: 2,
          hint_i18n: {
            fr: 'Il faut une casserolle d’eau chaude',
            en: 'A casserolle of hot water is needed',
            nl: 'Aflugeublik',
          },
        });
      });
    });
  });
});
