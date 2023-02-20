import _ from 'lodash';
import { expect, mockLearningContent, databaseBuilder, catchErr, domainBuilder } from '../../../test-helper';
import Tutorial from '../../../../lib/domain/models/Tutorial';
import TutorialEvaluation from '../../../../lib/domain/models/TutorialEvaluation';
import { NotFoundError } from '../../../../lib/domain/errors';
import tutorialRepository from '../../../../lib/infrastructure/repositories/tutorial-repository';
import TutorialForUser from '../../../../lib/domain/read-models/TutorialForUser';
import UserSavedTutorial from '../../../../lib/domain/models/UserSavedTutorial';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import { LOCALE } from '../../../../lib/domain/constants';

const { ENGLISH_SPOKEN: ENGLISH_SPOKEN } = LOCALE;

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
      const learningContent = { tutorials: tutorialsList };
      mockLearningContent(learningContent);

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

    it('should associate userSavedTutorial when it exists for provided user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userSavedTutorial = databaseBuilder.factory.buildUserSavedTutorial({ userId, tutorialId: 'recTutorial0' });
      await databaseBuilder.commit();

      const tutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      };
      const learningContent = { tutorials: [tutorial] };
      mockLearningContent(learningContent);
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
      await databaseBuilder.commit();

      const tutorial = {
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      };
      const learningContent = { tutorials: [tutorial] };
      mockLearningContent(learningContent);
      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: ['recTutorial0'], userId });

      // then
      expect(tutorials).to.have.lengthOf(1);
      expect(tutorials[0].tutorialEvaluation).to.deep.equal(tutorialEvaluation);
    });
  });

  describe('#findByRecordIds', function () {
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
        },
        {
          duration: '00:01:54',
          format: 'page',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
          id: 'recTutorial1',
        },
      ];
      const learningContent = { tutorials: tutorialsList };
      mockLearningContent(learningContent);

      // when
      const tutorials = await tutorialRepository.findByRecordIds(['recTutorial0', 'recTutorial1']);

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });
  });

  describe('#findPaginatedFilteredForCurrentUser', function () {
    let userId;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
    });

    context('when user has saved tutorials', function () {
      it('should return tutorials with user tutorials belonging to given user ordered by descending date of creation', async function () {
        // given
        const tutorialId1 = 'rec1Tutorial';
        const tutorialId2 = 'rec2Tutorial';

        const learningContent = {
          tutorials: [{ id: tutorialId1 }, { id: tutorialId2 }],
        };
        mockLearningContent(learningContent);

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
        expect(tutorialsForUser).to.have.length(2);
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

          const learningContent = {
            tutorials: [{ id: tutorialId }],
          };
          mockLearningContent(learningContent);

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

          const learningContent = {
            tutorials: [{ id: tutorialId1 }, { id: tutorialId2 }, { id: tutorialId3 }],
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
          };
          mockLearningContent(learningContent);

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

          const filters = { competences: ['competence2', 'competence3'] };

          // when
          const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
            userId,
            filters,
          });

          // then
          expect(tutorialsForUser).to.have.length(2);
          expect(tutorialsForUser.map(({ id }) => id)).to.deep.equal([tutorialId3, tutorialId2]);
        });
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });

        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
      });
    });

    context('when user has saved a tutorial which is not available anymore', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });
        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'recTutorial', userId });
        await databaseBuilder.commit();

        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedFilteredForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
      });

      it('should return row count of existing tutorials', async function () {
        // given
        const learningContent = {
          tutorials: [{ id: 'tuto1' }, { id: 'tuto2' }, { id: 'tuto3' }, { id: 'tuto4' }],
        };

        mockLearningContent(learningContent);

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
        const tutorials = [
          domainBuilder.buildTutorial({ id: 'tutorializé' }),
          domainBuilder.buildTutorial({ id: 'tutorialidé' }),
          domainBuilder.buildTutorial({ id: 'tutorialain' }),
          domainBuilder.buildTutorial({ id: 'tutorialadin' }),
        ];
        mockLearningContent({ tutorials });
        tutorials.forEach((tutorial) =>
          databaseBuilder.factory.buildUserSavedTutorial({ userId, tutorialId: tutorial.id })
        );
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
        const error = await catchErr(tutorialRepository.get)('recTutoImaginaire');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when tutorial exists', function () {
      it('should return the tutorial', async function () {
        // given
        const tutorials = [
          {
            duration: '00:00:54',
            format: 'video',
            link: 'https://tuto.fr',
            source: 'tuto.fr',
            title: 'tuto0',
            id: 'recTutorial0',
          },
        ];
        const learningContent = { tutorials: tutorials };
        mockLearningContent(learningContent);

        // when
        const tutorial = await tutorialRepository.get('recTutorial0');

        // then
        expect(tutorial).to.deep.equal(tutorials[0]);
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
      const learningContent = { tutorials: [...frenchTutorials, ...englishTutorials] };
      mockLearningContent(learningContent);

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
      const learningContent = { tutorials: [frenchTutorial, englishTutorial] };
      mockLearningContent(learningContent);

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
      const learningContent = { tutorials: [tutorial] };
      mockLearningContent(learningContent);

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
        mockLearningContent({
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
        await databaseBuilder.commit();

        mockLearningContent({
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

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

    describe('when there is one invalidated KE', function () {
      it('should return all fields from recommended tutorials', async function () {
        // given
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

        mockLearningContent({
          tutorials: [
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
          ],
          skills: [
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
          ],
        });

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

        mockLearningContent({
          tutorials: [
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
          ],
          skills: [
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
          ],
        });

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
        await databaseBuilder.commit();

        mockLearningContent({
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

        // when
        const { results } = await tutorialRepository.findPaginatedFilteredRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

    describe('when there is one invalidated KE and two skills referencing the same tutorial', function () {
      it('should return the same tutorial related to each skill', async function () {
        // given
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
        await databaseBuilder.commit();

        mockLearningContent({
          tutorials: [
            {
              id: 'tuto1',
              locale: 'fr-fr',
            },
          ],
          skills: [
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
          ],
        });

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
          await databaseBuilder.commit();

          mockLearningContent({
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
      });

      describe('when tutorials amount exceed page size', function () {
        it('should return page size number of tutorials', async function () {
          // given
          const page = { number: 2, size: 2 };
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'recSkill3',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            source: KnowledgeElement.SourceType.DIRECT,
          });
          await databaseBuilder.commit();

          mockLearningContent({
            tutorials: [
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
            ],
            skills: [
              {
                id: 'recSkill3',
                tutorialIds: ['tuto4', 'tuto5', 'tuto6'],
                status: 'actif',
              },
            ],
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

          mockLearningContent({
            tutorials: [
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
            ],
            skills: [
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
            ],
          });
          const expectedPagination = { page: 1, pageSize: 10, pageCount: 1, rowCount: 4 };
          await databaseBuilder.commit();

          const filters = { competences: ['competence2', 'competence3'] };

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

          mockLearningContent({
            tutorials: [
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
            ],
            skills: [
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
            ],
          });
          const expectedPagination = { page: 2, pageSize: 2, pageCount: 2, rowCount: 4 };
          await databaseBuilder.commit();

          const filters = { competences: ['competence2', 'competence3'] };

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
