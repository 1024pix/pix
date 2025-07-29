import _ from 'lodash';

import { Tutorial } from '../../../../../src/devcomp/domain/models/Tutorial.js';
import { UserSavedTutorial } from '../../../../../src/devcomp/domain/models/UserSavedTutorial.js';
import { TutorialForUser } from '../../../../../src/devcomp/domain/read-models/TutorialForUser.js';
import * as tutorialRepository from '../../../../../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { KnowledgeElement, TutorialEvaluation } from '../../../../../src/shared/domain/models/index.js';
import { ENGLISH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | tutorial-repository', function () {
  describe('#findByRecordIdsForCurrentUser', function () {
    it('should find tutorials by ids', async function () {
      // given
      const tutorialsList = [
        {
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.fr',
          source: 'tuto.fr',
          title: 'tuto0',
          id: 'recTutorial0',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
          id: 'recTutorial1',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
      ];
      databaseBuilder.factory.learningContent.build({
        tutorials: tutorialsList,
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: ['recTutorial0', 'recTutorial1'],
        userId: null,
      });

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(TutorialForUser);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });

    it('should avoid duplicates and nulls', async function () {
      // given
      const tutorialsList = [
        {
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.fr',
          source: 'tuto.fr',
          title: 'tuto0',
          id: 'recTutorial0',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
          id: 'recTutorial1',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
      ];
      databaseBuilder.factory.learningContent.build({
        tutorials: tutorialsList,
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: ['recTutorial0', 'recTutorial1', 'recCOUCOUPAPA', 'recTutorial1'],
        userId: null,
      });

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(TutorialForUser);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });

    it('should associate userSavedTutorial when it exists for provided user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userSavedTutorial = databaseBuilder.factory.buildUserSavedTutorial({
        userId,
        tutorialId: 'recTutorial0',
      });
      const tutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      };
      databaseBuilder.factory.learningContent.build({
        tutorials: [tutorial],
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: ['recTutorial0'], userId });

      // then
      expect(tutorials).to.have.lengthOf(1);
      expect(tutorials[0].userSavedTutorial).to.deep.equal(userSavedTutorial);
    });

    it('should associate tutorialEvaluation when it exists for provided user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const tutorialEvaluation = databaseBuilder.factory.buildTutorialEvaluation({
        userId,
        tutorialId: 'recTutorial0',
      });
      const tutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      };
      databaseBuilder.factory.learningContent.build({
        tutorials: [tutorial],
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: ['recTutorial0'], userId });

      // then
      expect(tutorials).to.have.lengthOf(1);
      expect(tutorials[0].tutorialEvaluation).to.deep.equal(tutorialEvaluation);
    });

    it('should return empty array when invalid argument given for ids', async function () {
      // given
      const tutorialsList = [
        {
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.fr',
          source: 'tuto.fr',
          title: 'tuto0',
          id: 'recTutorial0',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
          id: 'recTutorial1',
          skillId: undefined,
          userSavedTutorial: undefined,
          tutorialEvaluation: undefined,
        },
      ];
      databaseBuilder.factory.learningContent.build({
        tutorials: tutorialsList,
      });
      await databaseBuilder.commit();

      // when
      const tutorials1 = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: [],
        userId: null,
      });
      const tutorials2 = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: null,
        userId: null,
      });
      const tutorials3 = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: undefined,
        userId: null,
      });

      // then
      expect(tutorials1).to.deep.equal([]);
      expect(tutorials2).to.deep.equal([]);
      expect(tutorials3).to.deep.equal([]);
    });
  });

  describe('#findPaginatedFilteredForCurrentUser', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    context('when user has saved tutorials', function () {
      it('should return tutorials with user tutorials belonging to given user ordered by descending date of creation', async function () {
        // given
        const tutorialId1 = 'rec1Tutorial';
        const tutorialId2 = 'rec2Tutorial';
        databaseBuilder.factory.learningContent.build({
          tutorials: [{ id: tutorialId1 }, { id: tutorialId2 }],
        });
        const firstUserSavedTutorial = databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: tutorialId1,
          userId,
          createdAt: new Date('2022-05-01'),
        });
        const lastUserSavedTutorial = databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: tutorialId2,
          userId,
          skillId: 'skill123',
          createdAt: new Date('2022-05-02'),
        });
        await databaseBuilder.commit();

        // when
        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.have.lengthOf(2);
        expect(tutorialsForUser[0]).to.be.instanceOf(TutorialForUser);
        expect(tutorialsForUser[0].userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(tutorialsForUser[0].userSavedTutorial.userId).to.equal(userId);
        expect(tutorialsForUser.map((tutorialForUser) => tutorialForUser.userSavedTutorial.createdAt)).to.deep.equal([
          lastUserSavedTutorial.createdAt,
          firstUserSavedTutorial.createdAt,
        ]);
        expect(tutorialsForUser[0].skillId).to.equal(lastUserSavedTutorial.skillId);
        expect(tutorialsForUser[1].skillId).to.be.null;
      });

      context('when user has evaluated tutorial', function () {
        it('should return tutorial with evaluated tutorial belonging to given user', async function () {
          // given
          const tutorialId = 'recTutorial';
          databaseBuilder.factory.learningContent.build({
            tutorials: [{ id: tutorialId }],
          });
          databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId });
          databaseBuilder.factory.buildTutorialEvaluation({ tutorialId, userId });
          await databaseBuilder.commit();

          // when
          const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
            userId,
          });

          //then
          expect(tutorialsForUser[0].tutorialEvaluation.userId).to.equal(userId);
        });
      });

      context('when there are filters on competences', function () {
        it('should return only tutorials for skills associated to competences', async function () {
          // given
          const tutorialId1 = 'tutorial1';
          const tutorialId2 = 'tutorial2';
          const tutorialId3 = 'tutorial3';
          databaseBuilder.factory.learningContent.build({
            skills: [
              {
                id: 'skill1',
                tutorialIds: [tutorialId1],
                competenceId: 'competence1',
                status: 'actif',
              },
              {
                id: 'skill2',
                tutorialIds: [tutorialId2],
                competenceId: 'competence2',
                status: 'archivé',
              },
              {
                id: 'skill3',
                tutorialIds: [tutorialId3],
                competenceId: 'competence3',
                status: 'actif',
              },
            ],
            tutorials: [{ id: tutorialId1 }, { id: tutorialId2 }, { id: tutorialId3 }],
          });
          databaseBuilder.factory.buildUserSavedTutorial({
            tutorialId: tutorialId1,
            userId,
            createdAt: new Date('2022-05-01'),
          });
          databaseBuilder.factory.buildUserSavedTutorial({
            tutorialId: tutorialId2,
            userId,
            createdAt: new Date('2022-05-01'),
          });
          databaseBuilder.factory.buildUserSavedTutorial({
            tutorialId: tutorialId3,
            userId,
            skillId: 'skill123',
            createdAt: new Date('2022-05-02'),
          });
          await databaseBuilder.commit();
          const filters = { competences: 'competence2,competence3' };

          // when
          const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
            userId,
            filters,
          });

          // then
          expect(tutorialsForUser).to.have.lengthOf(2);
          expect(tutorialsForUser.map(({ id }) => id)).to.deep.equal([tutorialId3, tutorialId2]);
        });
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        // when
        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
      });
    });

    context('when user has saved a tutorial which is not available anymore', function () {
      it('should return an empty list', async function () {
        // given
        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'recTutorial', userId });
        await databaseBuilder.commit();

        // when
        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
      });

      it('should return row count of existing tutorials', async function () {
        // given
        databaseBuilder.factory.learningContent.build({
          tutorials: [{ id: 'tuto1' }, { id: 'tuto2' }, { id: 'tuto3' }, { id: 'tuto4' }],
        });
        databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'tuto1',
          userId,
          createdAt: new Date('2022-05-01'),
        });
        databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'tuto2',
          userId,
          createdAt: new Date('2022-05-02'),
        });
        databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'tuto3',
          userId,
          createdAt: new Date('2022-05-03'),
        });
        databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'tuto_erreurId',
          userId,
          createdAt: new Date('2022-05-04'),
        });
        databaseBuilder.factory.buildUserSavedTutorial({
          tutorialId: 'tuto4',
          userId,
          createdAt: new Date('2022-05-05'),
        });
        await databaseBuilder.commit();
        const expectedTutorialIds = ['tuto4', 'tuto3', 'tuto2', 'tuto1'];

        // when
        const { models: tutorialsForUser, meta } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
          page: { size: 4, number: 1 },
        });

        // then
        expect(tutorialsForUser.map((tutorial) => tutorial.id)).to.deep.equal(expectedTutorialIds);
        expect(meta).to.deep.equal({ page: 1, pageSize: 4, rowCount: 4, pageCount: 1 });
      });
    });

    context('when user-tutorials amount exceed page size', function () {
      it('should return page size number of user-tutorials', async function () {
        // given
        const page = { number: 2, size: 2 };
        const tutorials = [{ id: 'tutorializé' }, { id: 'tutorialidé' }, { id: 'tutorialain' }, { id: 'tutorialadin' }];
        databaseBuilder.factory.learningContent.build({
          tutorials,
        });
        tutorials.forEach((tutorial) => {
          databaseBuilder.factory.buildUserSavedTutorial({ userId, tutorialId: tutorial.id });
        });
        const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
        await databaseBuilder.commit();

        // when
        const { models: foundTutorials, meta: pagination } =
          await tutorialRepository.findPaginatedFilteredForCurrentUser({
            userId,
            page,
          });

        // then
        expect(foundTutorials).to.have.lengthOf(2);
        expect(pagination).to.include(expectedPagination);
      });
    });
  });

  describe('#get', function () {
    context('when tutorial does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(tutorialRepository.get)({ tutorialId: 'recTutoImaginaire' });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when tutorial exists', function () {
      it('should return the tutorial', async function () {
        // given
        databaseBuilder.factory.learningContent.build({
          tutorials: [
            {
              duration: '00:00:54',
              format: 'video',
              link: 'https://tuto.fr',
              source: 'tuto.fr',
              title: 'tuto0',
              id: 'recTutorial0',
            },
          ],
        });
        await databaseBuilder.commit();

        // when
        const tutorial = await tutorialRepository.get({ tutorialId: 'recTutorial0' });

        // then
        expect(tutorial).to.deep.equal(
          domainBuilder.buildTutorial({
            duration: '00:00:54',
            format: 'video',
            link: 'https://tuto.fr',
            source: 'tuto.fr',
            title: 'tuto0',
            id: 'recTutorial0',
          }),
        );
      });
    });
  });

  describe('#list', function () {
    it('should return all tutorials according to default locale', async function () {
      // given
      const frenchTutorials = [
        {
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.fr',
          source: 'tuto.fr',
          title: 'tuto0',
          id: 'recTutorial0',
          locale: 'fr-fr',
        },
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
          id: 'recTutorial1',
          locale: 'fr-fr',
        },
      ];
      const englishTutorials = [
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.uk',
          source: 'tuto.uk',
          title: 'tuto2',
          id: 'recTutorial2',
          locale: 'en-us',
        },
      ];
      databaseBuilder.factory.learningContent.build({
        tutorials: [...frenchTutorials, ...englishTutorials],
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.list({});

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      const expectedTutorials = frenchTutorials.map((tuto) => _.omit(tuto, 'locale'));
      expect(tutorials).to.deep.include.members(expectedTutorials);
    });

    it('should return tutorials according to given locale', async function () {
      // given
      const locale = ENGLISH_SPOKEN;
      const frenchTutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
        locale: 'fr-fr',
      };
      const englishTutorial = {
        duration: '00:01:54',
        format: 'page',
        link: 'https://tuto.uk',
        source: 'tuto.uk',
        title: 'tuto1',
        id: 'recTutorial1',
        locale: 'en-us',
      };
      databaseBuilder.factory.learningContent.build({
        tutorials: [frenchTutorial, englishTutorial],
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.list({ locale });

      // then
      expect(tutorials).to.have.lengthOf(1);
      const expectedTutorial = _.omit(englishTutorial, 'locale');
      expect(tutorials[0]).to.deep.equal(expectedTutorial);
    });

    it('should not break or return tutorials without locale', async function () {
      // given
      const locale = ENGLISH_SPOKEN;
      const tutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      };
      databaseBuilder.factory.learningContent.build({
        tutorials: [tutorial],
      });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.list({ locale });

      // then
      expect(tutorials).to.have.lengthOf(0);
    });
  });

  describe('#findPaginatedFilteredRecommendedByUserId', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
    });

    describe('when there are no invalidated and direct KE', function () {
      it('should return an empty page', async function () {
        // given
        databaseBuilder.factory.learningContent.build({
          tutorials: [
            {
              id: 'tuto1',
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              tutorialIds: ['tuto1', 'tuto2'],
              status: 'actif',
            },
          ],
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

    describe('when there are only validated KE', function () {
      it('should return an empty list', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill1',
          userId,
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        databaseBuilder.factory.learningContent.build({
          tutorials: [
            {
              id: 'tuto1',
              duration: '00:00:54',
              format: 'video',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'tuto.com',
              title: 'tuto1',
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              tutorialIds: ['tuto1', 'tuto2'],
              status: 'actif',
            },
          ],
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

    describe('when there is one invalidated KE', function () {
      it('should return all fields from recommended tutorials', async function () {
        // given
        const tutorials = [
          {
            id: 'tuto1',
            locale: 'fr-fr',
            link: 'https//example.net/tuto1',
            source: 'wikipedia',
            title: 'Mon super tuto',
            format: 'video',
            duration: '2min',
          },
          {
            id: 'tuto2',
            locale: 'fr-fr',
          },
          {
            id: 'tuto5',
            locale: 'fr-fr',
          },
        ];
        const skills = [
          {
            id: 'recSkill1',
            tutorialIds: ['tuto1', 'tuto2'],
            status: 'actif',
          },
          {
            id: 'recSkill4',
            tutorialIds: ['tuto5'],
            status: 'archivé',
          },
        ];
        databaseBuilder.factory.learningContent.build({
          tutorials,
          skills,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill1',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill4',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(_.omit(results[0], ['userSavedTutorial', 'tutorialEvaluation'])).to.deep.equal({
          id: 'tuto1',
          link: 'https//example.net/tuto1',
          source: 'wikipedia',
          title: 'Mon super tuto',
          format: 'video',
          duration: '2min',
          skillId: 'recSkill1',
        });
        expect(results.map((tutorial) => tutorial.id)).to.exactlyContain(['tuto1', 'tuto2', 'tuto5']);
      });

      it('should return tutorial related to user locale', async function () {
        // given
        const locale = 'en-us';
        const tutorials = [
          {
            id: 'tuto1',
            locale: 'en-us',
          },
          {
            id: 'tuto2',
            locale: 'en-us',
          },
          {
            id: 'tuto5',
            locale: 'fr-fr',
          },
        ];
        const skills = [
          {
            id: 'recSkill1',
            tutorialIds: ['tuto1', 'tuto2'],
            status: 'actif',
          },
          {
            id: 'recSkill4',
            tutorialIds: ['tuto5'],
            status: 'archivé',
          },
        ];
        databaseBuilder.factory.learningContent.build({
          tutorials,
          skills,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill1',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill4',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId, locale });

        // then
        expect(results.map((tutorial) => tutorial.id)).to.exactlyContain(['tuto2', 'tuto1']);
      });
    });

    describe('when there is one invalidated KE but skill is not operative', function () {
      it('should return an empty list', async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill3',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.learningContent.build({
          tutorials: [
            {
              id: 'tuto4',
              locale: 'fr-fr',
            },
          ],
          skills: [
            {
              id: 'recSkill3',
              tutorialIds: ['tuto4'],
              status: 'périmé',
            },
          ],
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

    describe('when there is one invalidated KE and two skills referencing the same tutorial', function () {
      it('should return the same tutorial related to each skill', async function () {
        // given
        const skills = [
          {
            id: 'recSkill1',
            tutorialIds: ['tuto1'],
            status: 'actif',
          },
          {
            id: 'recSkill2',
            tutorialIds: ['tuto1'],
            status: 'actif',
          },
        ];
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill1',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: 'recSkill2',
          userId,
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.learningContent.build({
          tutorials: [
            {
              id: 'tuto1',
              locale: 'fr-fr',
            },
          ],
          skills,
        });
        await databaseBuilder.commit();

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results.map(({ id, skillId }) => ({ id, skillId }))).to.exactlyContain([
          {
            id: 'tuto1',
            skillId: 'recSkill1',
          },
          {
            id: 'tuto1',
            skillId: 'recSkill2',
          },
        ]);
      });
    });

    describe('when there are invalidated and direct KE', function () {
      describe('when there are associated tutorial evaluations and saved tutorials', function () {
        it('should return both information', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          const userSavedTutorialId = databaseBuilder.factory.buildUserSavedTutorial({
            userId,
            tutorialId: 'tuto4',
            skillId: 'recSkill3',
          }).id;
          const tutorialEvaluationId = databaseBuilder.factory.buildTutorialEvaluation({
            tutorialId: 'tuto4',
            userId,
          }).id;
          databaseBuilder.factory.learningContent.build({
            tutorials: [
              {
                id: 'tuto4',
                locale: 'fr-fr',
              },
            ],
            skills: [
              {
                id: 'recSkill3',
                tutorialIds: ['tuto4'],
                status: 'actif',
              },
            ],
          });
          await databaseBuilder.commit();

          // when
          const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

          // then
          expect(results[0].tutorialEvaluation).to.include({
            id: tutorialEvaluationId,
            userId,
            tutorialId: 'tuto4',
            status: TutorialEvaluation.statuses.LIKED,
          });
          expect(results[0].userSavedTutorial).to.include({
            id: userSavedTutorialId,
            userId,
            skillId: 'recSkill3',
            tutorialId: 'tuto4',
          });
        });

        it('should avoid nulls and duplicates', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
            createdAt: new Date('2000-01-01'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
            createdAt: new Date('2000-01-02'),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkillWithoutTuto',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
            createdAt: new Date('2000-01-02'),
          });
          const userSavedTutorialId = databaseBuilder.factory.buildUserSavedTutorial({
            userId,
            tutorialId: 'tuto4',
            skillId: 'recSkill3',
          }).id;
          const tutorialEvaluationId = databaseBuilder.factory.buildTutorialEvaluation({
            tutorialId: 'tuto4',
            userId,
          }).id;
          databaseBuilder.factory.learningContent.build({
            tutorials: [
              {
                id: 'tuto4',
                locale: 'fr-fr',
              },
            ],
            skills: [
              {
                id: 'recSkill3',
                tutorialIds: ['tuto4'],
                status: 'actif',
              },
              {
                id: 'recSkillWithoutTuto',
                tutorialIds: [],
                status: 'actif',
              },
            ],
          });
          await databaseBuilder.commit();

          // when
          const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

          // then
          expect(results.length).to.equal(1);
          expect(results[0].tutorialEvaluation).to.include({
            id: tutorialEvaluationId,
            userId,
            tutorialId: 'tuto4',
            status: TutorialEvaluation.statuses.LIKED,
          });
          expect(results[0].userSavedTutorial).to.include({
            id: userSavedTutorialId,
            userId,
            skillId: 'recSkill3',
            tutorialId: 'tuto4',
          });
        });
      });

      describe('when tutorials amount exceed page size', function () {
        it('should return page size number of tutorials', async function () {
          // given
          const page = { number: 2, size: 2 };
          const tutorials = [
            {
              id: 'tuto4',
              locale: 'fr-fr',
            },
            {
              id: 'tuto5',
              locale: 'fr-fr',
            },
            {
              id: 'tuto6',
              locale: 'fr-fr',
            },
          ];
          databaseBuilder.factory.learningContent.build({
            tutorials,
            skills: [
              {
                id: 'recSkill3',
                tutorialIds: ['tuto4', 'tuto5', 'tuto6'],
                status: 'actif',
              },
            ],
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 3 };
          await databaseBuilder.commit();

          // when
          const { results: foundTutorials, pagination } =
            await tutorialRepository.findPaginatedFilteredRecommendedByUserId({
              userId,
              page,
            });

          // then
          expect(foundTutorials).to.have.lengthOf(1);
          expect(pagination).to.include(expectedPagination);
        });
      });

      describe('when there are competences filters', function () {
        it('should return only tutorials for skills associated to competences', async function () {
          // given
          const page = { number: 1, size: 10 };
          const tutorials = [
            {
              id: 'tuto1',
              locale: 'fr-fr',
            },
            {
              id: 'tuto2',
              locale: 'fr-fr',
            },
            {
              id: 'tuto3',
              locale: 'fr-fr',
            },
            {
              id: 'tuto4',
              locale: 'fr-fr',
            },
            {
              id: 'tuto5',
              locale: 'fr-fr',
            },
            {
              id: 'tuto6',
              locale: 'fr-fr',
            },
          ];
          const skills = [
            {
              id: 'recSkill1InCompetence1',
              tutorialIds: ['tuto1', 'tuto2'],
              status: 'actif',
              competenceId: 'competence1',
            },
            {
              id: 'recSkill2InCompetence2',
              tutorialIds: ['tuto3', 'tuto4'],
              status: 'actif',
              competenceId: 'competence2',
            },
            {
              id: 'recSkill3InCompetence2',
              tutorialIds: ['tuto5'],
              status: 'actif',
              competenceId: 'competence2',
            },
            {
              id: 'recSkill4InCompetence3',
              tutorialIds: ['tuto6'],
              status: 'actif',
              competenceId: 'competence3',
            },
          ];
          databaseBuilder.factory.learningContent.build({
            tutorials,
            skills,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill1InCompetence1',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill2InCompetence2',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3InCompetence2',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill4InCompetence3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          await databaseBuilder.commit();
          const expectedPagination = { page: 1, pageSize: 10, pageCount: 1, rowCount: 4 };

          const filters = { competences: 'competence2,competence3' };

          // when
          const { results: foundTutorials, pagination } =
            await tutorialRepository.findPaginatedFilteredRecommendedByUserId({
              userId,
              filters,
              page,
            });

          // then
          expect(foundTutorials).to.have.lengthOf(4);
          expect(foundTutorials.map(({ id }) => id)).to.deep.equal(['tuto3', 'tuto4', 'tuto5', 'tuto6']);
          expect(pagination).to.include(expectedPagination);
        });

        it('should return only tutorials for skills associated to competences for another page', async function () {
          // given
          const page = { number: 2, size: 2 };
          const tutorials = [
            {
              id: 'tuto1',
              locale: 'fr-fr',
            },
            {
              id: 'tuto2',
              locale: 'fr-fr',
            },
            {
              id: 'tuto3',
              locale: 'fr-fr',
            },
            {
              id: 'tuto4',
              locale: 'fr-fr',
            },
            {
              id: 'tuto5',
              locale: 'fr-fr',
            },
            {
              id: 'tuto6',
              locale: 'fr-fr',
            },
          ];
          const skills = [
            {
              id: 'recSkill1InCompetence1',
              tutorialIds: ['tuto1', 'tuto2'],
              status: 'actif',
              competenceId: 'competence1',
            },
            {
              id: 'recSkill2InCompetence2',
              tutorialIds: ['tuto3', 'tuto4'],
              status: 'actif',
              competenceId: 'competence2',
            },
            {
              id: 'recSkill3InCompetence2',
              tutorialIds: ['tuto5'],
              status: 'actif',
              competenceId: 'competence2',
            },
            {
              id: 'recSkill4InCompetence3',
              tutorialIds: ['tuto6'],
              status: 'actif',
              competenceId: 'competence3',
            },
          ];
          databaseBuilder.factory.learningContent.build({
            tutorials,
            skills,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill1InCompetence1',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill2InCompetence2',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3InCompetence2',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill4InCompetence3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          await databaseBuilder.commit();

          const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };

          const filters = { competences: 'competence2,competence3' };

          // when
          const { results: foundTutorials, pagination } =
            await tutorialRepository.findPaginatedFilteredRecommendedByUserId({
              userId,
              filters,
              page,
            });

          // then
          expect(foundTutorials).to.have.lengthOf(2);
          expect(foundTutorials.map(({ id }) => id)).to.deep.equal(['tuto5', 'tuto6']);
          expect(pagination).to.include(expectedPagination);
        });
      });
    });
  });
});
