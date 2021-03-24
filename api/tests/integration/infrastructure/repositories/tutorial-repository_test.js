const _ = require('lodash');
const { expect, mockLearningContent, databaseBuilder, catchErr } = require('../../../test-helper');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');
const { ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | Repository | tutorial-repository', function() {

  describe('#findByRecordIdsForCurrentUser', function() {

    it('should find tutorials by ids', async function() {
      // given
      const tutorialsList = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      }, {
        duration: '00:01:54',
        format: 'page',
        link: 'https://tuto.com',
        source: 'tuto.com',
        title: 'tuto1',
        id: 'recTutorial1',
      }];
      const learningContent = { tutorials: tutorialsList };
      mockLearningContent(learningContent);

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: ['recTutorial0', 'recTutorial1'], userId: null });

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });

    it('should associate userTutorial when it exists for provided user', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const userTutorial = databaseBuilder.factory.buildUserTutorial({ userId, tutorialId: 'recTutorial0' });
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

    it('should associate tutorialEvaluation when it exists for provided user', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const tutorialEvaluation = databaseBuilder.factory.buildTutorialEvaluation({ userId, tutorialId: 'recTutorial0' });
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

  describe('#findByRecordIds', function() {

    it('should find tutorials by ids', async function() {
      // given
      const tutorialsList = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      }, {
        duration: '00:01:54',
        format: 'page',
        link: 'https://tuto.com',
        source: 'tuto.com',
        title: 'tuto1',
        id: 'recTutorial1',
      }];
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

  describe('#get', function() {

    context('when tutorial does not exist', function() {

      it('should throw a NotFoundError', async function() {
        // when
        const error = await catchErr(tutorialRepository.get)('recTutoImaginaire');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when tutorial exists', function() {

      it('should return the tutorial', async function() {
        // given
        const tutorials = [{
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.fr',
          source: 'tuto.fr',
          title: 'tuto0',
          id: 'recTutorial0',
        }];
        const learningContent = { tutorials: tutorials };
        mockLearningContent(learningContent);

        // when
        const tutorial = await tutorialRepository.get('recTutorial0');

        // then
        expect(tutorial).to.deep.equal(tutorials[0]);
      });
    });
  });

  describe('#list', function() {

    it('should return all tutorials according to default locale', async function() {
      // given
      const frenchTutorials = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
        locale: 'fr-fr',
      }, {
        duration: '00:01:54',
        format: 'page',
        link: 'https://tuto.com',
        source: 'tuto.com',
        title: 'tuto1',
        id: 'recTutorial1',
        locale: 'fr-fr',
      }];
      const englishTutorials = [{
        duration: '00:01:54',
        format: 'page',
        link: 'https://tuto.uk',
        source: 'tuto.uk',
        title: 'tuto2',
        id: 'recTutorial2',
        locale: 'en-us',
      }];
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

    it('should return tutorials according to given locale', async function() {
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

    it('should not break or return tutorials without locale', async function() {
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
});
