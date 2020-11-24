const { expect, mockLearningContent, databaseBuilder, catchErr } = require('../../../test-helper');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');

describe('Integration | Repository | tutorial-repository', () => {

  describe('#findByRecordIdsForCurrentUser', () => {

    it('should find tutorials by ids', async () => {
      // given
      const tutorialsList = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      },{
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

    it('should associate userTutorial when it exists for provided user', async () => {
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

    it('should associate tutorialEvaluation when it exists for provided user', async () => {
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

  describe('#findByRecordIds', () => {

    it('should find tutorials by ids', async () => {
      // given
      const tutorialsList = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      },{
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

  describe('#get', () => {

    context('when tutorial does not exist', () => {

      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(tutorialRepository.get)('recTutoImaginaire');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when tutorial exists', () => {

      it('should return the tutorial', async () => {
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

  describe('#list', () => {

    it('should return all tutorials', async () => {
      // given
      const tutorialsList = [{
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.fr',
        source: 'tuto.fr',
        title: 'tuto0',
        id: 'recTutorial0',
      },{
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
      const tutorials = await tutorialRepository.list();

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members(tutorialsList);
    });
  });
});
