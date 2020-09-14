const { expect, airtableBuilder, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');

describe('Integration | Repository | tutorial-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#findByRecordIdsForCurrentUser', () => {

    it('should find tutorials by ids', async () => {
      // given
      const tutorial0 = domainBuilder.buildTutorial();
      const tutorial1 = domainBuilder.buildTutorial();
      const airtableTutorial0 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial0 });
      const airtableTutorial1 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial1 });
      airtableBuilder.mockLists({ tutorials: [airtableTutorial0, airtableTutorial1] });

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: [tutorial0.id, tutorial1.id], userId: null });

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members([tutorial0, tutorial1]);
    });

    it('should associate userTutorial when it exists for provided user', async () => {
      // given
      const tutorial = domainBuilder.buildTutorial();
      const airtableTutorial0 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial });
      airtableBuilder.mockLists({ tutorials: [airtableTutorial0] });
      const userId = databaseBuilder.factory.buildUser().id;
      const userTutorial = databaseBuilder.factory.buildUserTutorial({ userId, tutorialId: tutorial.id });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: [tutorial.id], userId });

      // then
      expect(tutorials).to.have.lengthOf(1);
      expect(tutorials[0].userTutorial).to.deep.equal(userTutorial);
    });

    it('should associate tutorialEvaluation when it exists for provided user', async () => {
      // given
      const tutorial = domainBuilder.buildTutorial();
      const airtableTutorial0 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial });
      airtableBuilder.mockLists({ tutorials: [airtableTutorial0] });
      const userId = databaseBuilder.factory.buildUser().id;
      const tutorialEvaluation = databaseBuilder.factory.buildTutorialEvaluation({ userId, tutorialId: tutorial.id });
      await databaseBuilder.commit();

      // when
      const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: [tutorial.id], userId });

      // then
      expect(tutorials).to.have.lengthOf(1);
      expect(tutorials[0].tutorialEvaluation).to.deep.equal(tutorialEvaluation);
    });
  });

  describe('#findByRecordIds', () => {

    it('should find tutorials by ids', async () => {
      // given
      const tutorial0 = domainBuilder.buildTutorial();
      const tutorial1 = domainBuilder.buildTutorial();
      const airtableTutorial0 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial0 });
      const airtableTutorial1 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial1 });
      airtableBuilder.mockLists({ tutorials: [airtableTutorial0, airtableTutorial1] });

      // when
      const tutorials = await tutorialRepository.findByRecordIds([tutorial0.id, tutorial1.id]);

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members([tutorial0, tutorial1]);
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
        const expectedTutorial = domainBuilder.buildTutorial();
        const airtableTutorial = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: expectedTutorial });
        airtableBuilder.mockLists({ tutorials: [airtableTutorial] });

        // when
        const tutorial = await tutorialRepository.get(expectedTutorial.id);

        // then
        expect(tutorial).to.deep.equal(expectedTutorial);
      });
    });
  });

  describe('#list', () => {

    it('should return all tutorials', async () => {
      // given
      const tutorial0 = domainBuilder.buildTutorial();
      const tutorial1 = domainBuilder.buildTutorial();
      const airtableTutorial0 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial0 });
      const airtableTutorial1 = airtableBuilder.factory.buildTutorial.fromDomain({ domainTutorial: tutorial1 });
      airtableBuilder.mockLists({ tutorials: [airtableTutorial0, airtableTutorial1] });

      // when
      const tutorials = await tutorialRepository.list();

      // then
      expect(tutorials).to.have.lengthOf(2);
      expect(tutorials[0]).to.be.instanceof(Tutorial);
      expect(tutorials).to.deep.include.members([tutorial0, tutorial1]);
    });
  });
});
