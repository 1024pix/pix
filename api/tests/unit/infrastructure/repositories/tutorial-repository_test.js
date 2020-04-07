const { expect, sinon, catchErr } = require('../../../test-helper');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const AirtableNotFoundError = require('../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');
const tutorialDatasource = require('../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialRepository = require('../../../../lib/infrastructure/repositories/tutorial-repository');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Repository | tutorial-repository', () => {

  let tutorialData1;
  let tutorialData2;
  let expectedTutorial;
  let expectedTutorial2;
  let userId;
  let userTutorial;

  beforeEach(() => {
    tutorialData1 = {
      id: 'recTutorial1',
      duration: '00:01:30',
      format: 'video',
      link: 'https://youtube.fr',
      source: 'Youtube',
      title: 'Comment dresser un panda',
    };

    tutorialData2 = {
      id: 'recTutorial2',
      duration: '00:04:30',
      format: 'page',
      link: 'https://youtube.fr',
      source: 'Youtube',
      title: 'Comment dresser un lama',
    };

    expectedTutorial = new Tutorial({
      id: 'recTutorial1',
      duration: '00:01:30',
      format: 'video',
      link: 'https://youtube.fr',
      source: 'Youtube',
      title: 'Comment dresser un panda',
    });

    expectedTutorial2 = new Tutorial({
      id: 'recTutorial2',
      duration: '00:04:30',
      format: 'page',
      link: 'https://youtube.fr',
      source: 'Youtube',
      title: 'Comment dresser un lama',
    });

    userId = 'userId';
    userTutorial = { id: 'userId_recTutorial1', userId, tutorialId: 'recTutorial1' };
  });

  describe('#findByRecordIds', () => {
    beforeEach(() => {
      // given
      sinon.stub(tutorialDatasource, 'findByRecordIds')
        .withArgs(['recTutorial1', 'recTutorial2'])
        .resolves([tutorialData1, tutorialData2]);
    });

    it('should return a list of Domain Tutorial objects', async () => {
      // given
      const tutorialIds = ['recTutorial1', 'recTutorial2'];
      const expectedTutorialList = [
        expectedTutorial,
        expectedTutorial2
      ];

      // when
      const fetchedTutorialList = await tutorialRepository.findByRecordIds(tutorialIds);

      // then
      expect(fetchedTutorialList[0]).to.be.an.instanceOf(Tutorial);
      expect(fetchedTutorialList[1]).to.be.an.instanceOf(Tutorial);
      expect(fetchedTutorialList).to.deep.equal(expectedTutorialList);
    });
  });

  describe('#findByRecordIdsForCurrentUser', () => {
    beforeEach(() => {
      // given
      sinon.stub(tutorialDatasource, 'findByRecordIds')
        .withArgs(['recTutorial1', 'recTutorial2'])
        .resolves([tutorialData1, tutorialData2]);
      sinon.stub(userTutorialRepository, 'find')
        .withArgs({ userId })
        .resolves([userTutorial]);
    });

    it('should return a list of Domain Tutorial objects', async () => {
      // given
      const tutorialIds = ['recTutorial1', 'recTutorial2'];
      expectedTutorial.userTutorial = userTutorial;
      const expectedTutorialList = [
        expectedTutorial,
        expectedTutorial2
      ];

      // when
      const fetchedTutorialList = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialIds, userId });

      // then
      expect(fetchedTutorialList[0]).to.be.an.instanceOf(Tutorial);
      expect(fetchedTutorialList[1]).to.be.an.instanceOf(Tutorial);
      expect(fetchedTutorialList).to.deep.equal(expectedTutorialList);
    });
  });

  describe('#get', () => {

    context('when tutorial is found', () => {
      beforeEach(() => {
        // given
        sinon.stub(tutorialDatasource, 'get')
          .withArgs('recTutorial1')
          .resolves(tutorialData1);
      });

      it('should return a domain Tutorial object', async () => {
        // when
        const fetchedTutorial = await tutorialRepository.get('recTutorial1');

        // then
        expect(fetchedTutorial).to.be.an.instanceOf(Tutorial);
        expect(fetchedTutorial).to.deep.equal(expectedTutorial);
      });

    });

    context('when tutorial is not found', () => {
      beforeEach(() => {
        // given
        sinon.stub(tutorialDatasource, 'get')
          .withArgs('recTutorial1')
          .rejects(new AirtableNotFoundError());
      });

      it('should return a NotFound error', async () => {
        // when
        const result = await catchErr(tutorialRepository.get)('recTutorial1');

        // then
        expect(result).to.be.instanceOf(NotFoundError);
        expect(result.message).to.deep.equal('Tutorial not found');
      });
    });
  });

});
