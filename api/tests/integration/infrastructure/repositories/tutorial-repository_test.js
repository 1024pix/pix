const _ = require('lodash');
const { expect, mockLearningContent, databaseBuilder, catchErr, domainBuilder } = require('../../../test-helper');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');
const TutorialForUser = require('../../../../lib/domain/read-models/TutorialForUser');
const UserSavedTutorial = require('../../../../lib/domain/models/UserSavedTutorial');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const { ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

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
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({
        ids: ['recTutorial0', 'recTutorial1'],
        userId: null,
      });

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });

    it('should associate userTutorial when it exists for provided user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userTutorial = databaseBuilder.factory.buildUserSavedTutorial({ userId, tutorialId: 'recTutorial0' });
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
      expect(tutorials[0].userTutorial).to.deep.equal(userTutorial);
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

  describe('#findPaginatedForCurrentUser', function () {
    let userId;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
    });

    context('when user has saved tutorials', function () {
      it('should return tutorial with user tutorial belonging to given user', async function () {
        // given
        const tutorialId = 'recTutorial';

        const learningContent = {
          tutorials: [{ id: tutorialId }],
        };
        mockLearningContent(learningContent);

        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.have.length(1);
        expect(tutorialsForUser[0]).to.be.instanceOf(TutorialForUser);
        expect(tutorialsForUser[0].userTutorial).to.be.instanceOf(UserSavedTutorial);
        expect(tutorialsForUser[0].userTutorial.userId).to.equal(userId);
      });

      context('when user has evaluated tutorial ', function () {
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
          const { models: tutorialsForUser } = await tutorialRepository.findPaginatedForCurrentUser({
            userId,
          });

          //then
          expect(tutorialsForUser[0].tutorialEvaluation.userId).to.equal(userId);
        });
      });
    });

    context('when user has not saved tutorial', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });

        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
      });
    });

    context('when user has saved a tutorial not available anymore', function () {
      it('should return an empty list', async function () {
        mockLearningContent({ tutorials: [] });
        databaseBuilder.factory.buildUserSavedTutorial({ tutorialId: 'recTutorial', userId });
        await databaseBuilder.commit();

        const { models: tutorialsForUser } = await tutorialRepository.findPaginatedForCurrentUser({
          userId,
        });

        // then
        expect(tutorialsForUser).to.deep.equal([]);
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
        const { models: foundTutorials, meta: pagination } = await tutorialRepository.findPaginatedForCurrentUser({
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

  describe('#findRecommendedByUserId', function () {
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
        const results = await tutorialRepository.findRecommendedByUserId({ userId });

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
        const results = await tutorialRepository.findRecommendedByUserId({ userId });

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
        const results = await tutorialRepository.findRecommendedByUserId({ userId });

        // then
        expect(results.map((tutorial) => tutorial.id)).to.exactlyContain(['tuto2', 'tuto1', 'tuto5']);
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
        const results = await tutorialRepository.findRecommendedByUserId({ userId, locale });

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
        const results = await tutorialRepository.findRecommendedByUserId({ userId });

        // then
        expect(results).to.deep.equal([]);
      });
    });

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
        const results = await tutorialRepository.findRecommendedByUserId({ userId });

        // then
        expect(results.map((tutorial) => tutorial.tutorialEvaluation)).to.exactlyContain([
          {
            id: tutorialEvaluationId,
            userId,
            tutorialId: 'tuto4',
          },
        ]);
        expect(results.map((tutorial) => tutorial.userTutorial)).to.exactlyContain([
          {
            id: userSavedTutorialId,
            userId,
            skillId: 'recSkill3',
            tutorialId: 'tuto4',
          },
        ]);
      });
    });
  });
});
