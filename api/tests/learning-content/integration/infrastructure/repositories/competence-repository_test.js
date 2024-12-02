import { competenceRepository } from '../../../../../src/learning-content/infrastructure/repositories/competence-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Competence', function () {
  afterEach(async function () {
    await knex('learningcontent.competences').truncate();
  });

  describe('#saveMany', function () {
    it('should insert competences', async function () {
      // given
      const competenceDtos = [
        {
          id: 'competence11',
          index: '1.1',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2', 'skill3'],
          thematicIds: ['thematic1', 'thematic2'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.1',
            en: 'Competence 1.1',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.1',
            en: 'It’s competence 1.1',
          },
        },
        {
          id: 'competence12',
          index: '1.2',
          areaId: 'area1',
          skillIds: ['skill4', 'skill5'],
          thematicIds: ['thematic3'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.2',
            en: 'Competence 1.2',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.2',
            en: 'It’s competence 1.2',
          },
        },
        {
          id: 'competence21',
          index: '2.1',
          areaId: 'area2',
          skillIds: ['skill6', 'skill7', 'skill8', 'skill9'],
          thematicIds: ['thematic4', 'thematic5'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 2.1',
            en: 'Competence 2.1',
          },
          description_i18n: {
            fr: 'C’est la compétence 2.1',
            en: 'It’s competence 2.1',
          },
        },
        {
          id: 'competenceJunior11',
          index: '1.1',
          areaId: 'areaJunior1',
          skillIds: ['skillJunior1', 'skillJunior2'],
          thematicIds: ['thematicJunior1'],
          origin: 'Pix Junior',
          name_i18n: {
            fr: 'Compétence 1.1 Junior',
            en: 'Competence 1.1 Junior',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.1 Junior',
            en: 'It’s competence 1.1 Junior',
          },
        },
      ];

      // when
      await competenceRepository.saveMany(competenceDtos);

      // then
      const savedCompetences = await knex.select('*').from('learningcontent.competences').orderBy(['origin', 'index']);

      expect(savedCompetences).to.deep.equal([
        {
          id: 'competence11',
          index: '1.1',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2', 'skill3'],
          thematicIds: ['thematic1', 'thematic2'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.1',
            en: 'Competence 1.1',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.1',
            en: 'It’s competence 1.1',
          },
        },
        {
          id: 'competence12',
          index: '1.2',
          areaId: 'area1',
          skillIds: ['skill4', 'skill5'],
          thematicIds: ['thematic3'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.2',
            en: 'Competence 1.2',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.2',
            en: 'It’s competence 1.2',
          },
        },
        {
          id: 'competence21',
          index: '2.1',
          areaId: 'area2',
          skillIds: ['skill6', 'skill7', 'skill8', 'skill9'],
          thematicIds: ['thematic4', 'thematic5'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 2.1',
            en: 'Competence 2.1',
          },
          description_i18n: {
            fr: 'C’est la compétence 2.1',
            en: 'It’s competence 2.1',
          },
        },
        {
          id: 'competenceJunior11',
          index: '1.1',
          areaId: 'areaJunior1',
          skillIds: ['skillJunior1', 'skillJunior2'],
          thematicIds: ['thematicJunior1'],
          origin: 'Pix Junior',
          name_i18n: {
            fr: 'Compétence 1.1 Junior',
            en: 'Competence 1.1 Junior',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.1 Junior',
            en: 'It’s competence 1.1 Junior',
          },
        },
      ]);
    });

    describe('when some competences already exist', function () {
      it('should upsert competences and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competence11',
          index: '1.1',
          areaId: 'area1',
          skillIds: ['skill1'],
          thematicIds: ['thematic1'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.1 old',
            en: 'Competence 1.1 old',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.1 old',
            en: 'It’s competence 1.1 old',
          },
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competence12',
          index: '1.2',
          areaId: 'area1',
          skillIds: ['skill4'],
          thematicIds: ['thematic3'],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 1.2 old',
            en: 'Competence 1.2 old',
          },
          description_i18n: {
            fr: 'C’est la compétence 1.2 old',
            en: 'It’s competence 1.2 old',
          },
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competence21',
          index: '2.1',
          areaId: 'area2',
          skillIds: [],
          thematicIds: [],
          origin: 'Pix',
          name_i18n: {
            fr: 'Compétence 2.1 old',
            en: 'Competence 2.1 old',
          },
          description_i18n: {
            fr: 'C’est la compétence 2.1 old',
            en: 'It’s competence 2.1 old',
          },
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'competenceDinosaure',
          index: '1.1',
          areaId: 'areaDinosaure1',
          skillIds: ['skillDinosaure1', 'skillDinosaure2'],
          thematicIds: ['thematicDinosaure1'],
          origin: 'Pix+ Dinosaure',
          name_i18n: {
            fr: 'Compétence Dinosaure',
            en: 'Competence Dinosaur',
          },
          description_i18n: {
            fr: 'C’est la compétence Dinosaure',
            en: 'It’s competence Dinosaur',
          },
        });
        await databaseBuilder.commit();

        const competenceDtos = [
          {
            id: 'competence11',
            index: '1.1',
            areaId: 'area1',
            skillIds: ['skill1', 'skill2', 'skill3'],
            thematicIds: ['thematic1', 'thematic2'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 1.1',
              en: 'Competence 1.1',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.1',
              en: 'It’s competence 1.1',
            },
          },
          {
            id: 'competence12',
            index: '1.2',
            areaId: 'area1',
            skillIds: ['skill4', 'skill5'],
            thematicIds: ['thematic3'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 1.2',
              en: 'Competence 1.2',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.2',
              en: 'It’s competence 1.2',
            },
          },
          {
            id: 'competence21',
            index: '2.1',
            areaId: 'area2',
            skillIds: ['skill6', 'skill7', 'skill8', 'skill9'],
            thematicIds: ['thematic4', 'thematic5'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 2.1',
              en: 'Competence 2.1',
            },
            description_i18n: {
              fr: 'C’est la compétence 2.1',
              en: 'It’s competence 2.1',
            },
          },
          {
            id: 'competenceJunior11',
            index: '1.1',
            areaId: 'areaJunior1',
            skillIds: ['skillJunior1', 'skillJunior2'],
            thematicIds: ['thematicJunior1'],
            origin: 'Pix Junior',
            name_i18n: {
              fr: 'Compétence 1.1 Junior',
              en: 'Competence 1.1 Junior',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.1 Junior',
              en: 'It’s competence 1.1 Junior',
            },
          },
        ];

        // when
        await competenceRepository.saveMany(competenceDtos);

        // then
        const savedCompetences = await knex
          .select('*')
          .from('learningcontent.competences')
          .orderBy(['origin', 'index']);

        expect(savedCompetences).to.deep.equal([
          {
            id: 'competence11',
            index: '1.1',
            areaId: 'area1',
            skillIds: ['skill1', 'skill2', 'skill3'],
            thematicIds: ['thematic1', 'thematic2'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 1.1',
              en: 'Competence 1.1',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.1',
              en: 'It’s competence 1.1',
            },
          },
          {
            id: 'competence12',
            index: '1.2',
            areaId: 'area1',
            skillIds: ['skill4', 'skill5'],
            thematicIds: ['thematic3'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 1.2',
              en: 'Competence 1.2',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.2',
              en: 'It’s competence 1.2',
            },
          },
          {
            id: 'competence21',
            index: '2.1',
            areaId: 'area2',
            skillIds: ['skill6', 'skill7', 'skill8', 'skill9'],
            thematicIds: ['thematic4', 'thematic5'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 2.1',
              en: 'Competence 2.1',
            },
            description_i18n: {
              fr: 'C’est la compétence 2.1',
              en: 'It’s competence 2.1',
            },
          },
          {
            id: 'competenceJunior11',
            index: '1.1',
            areaId: 'areaJunior1',
            skillIds: ['skillJunior1', 'skillJunior2'],
            thematicIds: ['thematicJunior1'],
            origin: 'Pix Junior',
            name_i18n: {
              fr: 'Compétence 1.1 Junior',
              en: 'Competence 1.1 Junior',
            },
            description_i18n: {
              fr: 'C’est la compétence 1.1 Junior',
              en: 'It’s competence 1.1 Junior',
            },
          },
          {
            id: 'competenceDinosaure',
            index: '1.1',
            areaId: 'areaDinosaure1',
            skillIds: ['skillDinosaure1', 'skillDinosaure2'],
            thematicIds: ['thematicDinosaure1'],
            origin: 'Pix+ Dinosaure',
            name_i18n: {
              fr: 'Compétence Dinosaure',
              en: 'Competence Dinosaur',
            },
            description_i18n: {
              fr: 'C’est la compétence Dinosaure',
              en: 'It’s competence Dinosaur',
            },
          },
        ]);
      });
    });
  });

  describe('#save', function () {
    beforeEach(async function () {
      databaseBuilder.factory.learningContent.buildCompetence({ id: 'competenceIdB' });
      await databaseBuilder.commit();
    });

    it('should insert competence when it does not exist in DB', async function () {
      // given
      const competenceDto = {
        id: 'competence11',
        index: '1.1',
        areaId: 'area1',
        skillIds: ['skill1', 'skill2', 'skill3'],
        thematicIds: ['thematic1', 'thematic2'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Compétence 1.1',
          en: 'Competence 1.1',
        },
        description_i18n: {
          fr: 'C’est la compétence 1.1',
          en: 'It’s competence 1.1',
        },
      };

      // when
      await competenceRepository.save(competenceDto);

      // then
      const savedCompetence = await knex
        .select('*')
        .from('learningcontent.competences')
        .where({ id: competenceDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.competences').count();
      expect(count).to.equal(2);
      expect(savedCompetence).to.deep.equal({
        id: 'competence11',
        index: '1.1',
        areaId: 'area1',
        skillIds: ['skill1', 'skill2', 'skill3'],
        thematicIds: ['thematic1', 'thematic2'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Compétence 1.1',
          en: 'Competence 1.1',
        },
        description_i18n: {
          fr: 'C’est la compétence 1.1',
          en: 'It’s competence 1.1',
        },
      });
    });

    it('should update competence when it does exist in DB', async function () {
      // given
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'competence11',
        index: '1.1',
        areaId: 'area1',
        skillIds: ['skill1'],
        thematicIds: ['thematic1'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Compétence 1.1 old',
          en: 'Competence 1.1 old',
        },
        description_i18n: {
          fr: 'C’est la compétence 1.1 old',
          en: 'It’s competence 1.1 old',
        },
      });
      await databaseBuilder.commit();
      const competenceDto = {
        id: 'competence11',
        index: '1.1',
        areaId: 'area1',
        skillIds: ['skill1', 'skill2', 'skill3'],
        thematicIds: ['thematic1', 'thematic2'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Compétence 1.1',
          en: 'Competence 1.1',
        },
        description_i18n: {
          fr: 'C’est la compétence 1.1',
          en: 'It’s competence 1.1',
        },
      };

      // when
      await competenceRepository.save(competenceDto);

      // then
      const savedCompetence = await knex
        .select('*')
        .from('learningcontent.competences')
        .where({ id: competenceDto.id })
        .first();
      const [{ count }] = await knex('learningcontent.competences').count();
      expect(count).to.equal(2);
      expect(savedCompetence).to.deep.equal({
        id: 'competence11',
        index: '1.1',
        areaId: 'area1',
        skillIds: ['skill1', 'skill2', 'skill3'],
        thematicIds: ['thematic1', 'thematic2'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Compétence 1.1',
          en: 'Competence 1.1',
        },
        description_i18n: {
          fr: 'C’est la compétence 1.1',
          en: 'It’s competence 1.1',
        },
      });
    });
  });
});
