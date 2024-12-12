import { courseRepository } from '../../../../../src/learning-content/infrastructure/repositories/course-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Learning Content | Integration | Repositories | Course', function () {
  afterEach(async function () {
    await knex('learningcontent.courses').truncate();
  });

  describe('#save', function () {
    it('should insert courses', async function () {
      // given
      const courseDtos = [
        {
          id: 'courseIdA',
          name: 'instruction Test Statique A',
          description: 'description Test Statique A',
          isActive: true,
          competences: ['competenceIdA'],
          challenges: ['challengeIdA'],
        },
        {
          id: 'courseIdB',
          name: 'instruction Test Statique B',
          description: 'description Test Statique B',
          isActive: true,
          competences: ['competenceIdB'],
          challenges: ['challengeIdB1', 'challengeIdB2'],
        },
        {
          id: 'courseIdC',
          name: 'instruction Test Statique C',
          description: 'description Test Statique C',
          isActive: false,
          competences: ['competenceIdC1', 'competenceIdC2'],
          challenges: ['challengeIdC1'],
        },
      ];

      // when
      await courseRepository.save(courseDtos);

      // then
      const savedCourses = await knex.select('*').from('learningcontent.courses').orderBy('id');

      expect(savedCourses).to.deep.equal([
        {
          id: 'courseIdA',
          name: 'instruction Test Statique A',
          description: 'description Test Statique A',
          isActive: true,
          competences: ['competenceIdA'],
          challenges: ['challengeIdA'],
        },
        {
          id: 'courseIdB',
          name: 'instruction Test Statique B',
          description: 'description Test Statique B',
          isActive: true,
          competences: ['competenceIdB'],
          challenges: ['challengeIdB1', 'challengeIdB2'],
        },
        {
          id: 'courseIdC',
          name: 'instruction Test Statique C',
          description: 'description Test Statique C',
          isActive: false,
          competences: ['competenceIdC1', 'competenceIdC2'],
          challenges: ['challengeIdC1'],
        },
      ]);
    });

    describe('when some courses already exist', function () {
      it('should upsert courses and keep missing ones', async function () {
        // given
        databaseBuilder.factory.learningContent.buildCourse({
          id: 'courseIdA',
          name: 'instruction Test Statique A',
          description: 'description Test Statique A',
          isActive: true,
          competences: ['competenceIdA'],
          challenges: ['challengeIdA'],
        });
        databaseBuilder.factory.learningContent.buildCourse({
          id: 'courseIdB',
          name: 'instruction Test Statique B',
          description: 'description Test Statique B',
          isActive: true,
          competences: ['competenceIdB'],
          challenges: ['challengeIdB1', 'challengeIdB2'],
        });
        await databaseBuilder.commit();

        const courseDtos = [
          {
            id: 'courseIdA',
            name: 'instruction Test Statique A modified',
            description: 'description Test Statique A modified',
            isActive: false,
            competences: ['competenceIdA modified'],
            challenges: ['challengeIdA1 modified', 'challengeIdA2 modified'],
          },
          {
            id: 'courseIdC',
            name: 'instruction Test Statique C',
            description: 'description Test Statique C',
            isActive: false,
            competences: ['competenceIdC1', 'competenceIdC2'],
            challenges: ['challengeIdC1'],
          },
        ];

        // when
        await courseRepository.save(courseDtos);

        // then
        const savedCourses = await knex.select('*').from('learningcontent.courses').orderBy('id');

        expect(savedCourses).to.deep.equal([
          {
            id: 'courseIdA',
            name: 'instruction Test Statique A modified',
            description: 'description Test Statique A modified',
            isActive: false,
            competences: ['competenceIdA modified'],
            challenges: ['challengeIdA1 modified', 'challengeIdA2 modified'],
          },
          {
            id: 'courseIdB',
            name: 'instruction Test Statique B',
            description: 'description Test Statique B',
            isActive: true,
            competences: ['competenceIdB'],
            challenges: ['challengeIdB1', 'challengeIdB2'],
          },
          {
            id: 'courseIdC',
            name: 'instruction Test Statique C',
            description: 'description Test Statique C',
            isActive: false,
            competences: ['competenceIdC1', 'competenceIdC2'],
            challenges: ['challengeIdC1'],
          },
        ]);
      });
    });
  });
});
