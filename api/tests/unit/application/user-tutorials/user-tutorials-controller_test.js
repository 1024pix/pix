const { sinon, expect, hFake } = require('../../../test-helper');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');
const usecases = require('../../../../lib/domain/usecases');
const userTutorialSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');
const userTutorialRepository = require('../../../../lib/infrastructure/repositories/user-tutorial-repository');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Controller | User-tutorials', function () {
  describe('#add', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });
      sinon.stub(userTutorialSerializer, 'deserialize').returns({});

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.add(request, hFake);

      // then
      const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
      expect(addTutorialToUserArgs).to.have.property('userId', userId);
      expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
    });

    describe('when skill id is given', function () {
      it('should call the expected usecase', async function () {
        // given
        const skillId = 'skillId';
        const tutorialId = 'tutorialId';
        const userId = 'userId';
        sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });
        sinon.stub(userTutorialSerializer, 'deserialize').returns({ skillId });

        const request = {
          auth: { credentials: { userId } },
          params: { tutorialId },
          payload: { data: { attributes: { 'skill-id': 'skillId' } } },
        };

        // when
        await userTutorialsController.add(request, hFake);

        // then
        const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
        expect(addTutorialToUserArgs).to.have.property('userId', userId);
        expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
        expect(addTutorialToUserArgs).to.have.property('skillId', skillId);
        expect(userTutorialSerializer.deserialize).to.have.been.calledWith(request.payload);
      });
    });
  });

  describe('#find', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      sinon.stub(usecases, 'findUserTutorials').returns([]);

      const request = {
        auth: { credentials: { userId } },
      };

      // when
      await userTutorialsController.find(request, hFake);

      // then
      const findUserTutorialsArgs = usecases.findUserTutorials.firstCall.args[0];
      expect(findUserTutorialsArgs).to.have.property('userId', userId);
    });
  });

  describe('#findRecommended', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      const extractedParams = {
        page: {
          number: '1',
          size: '200',
        },
      };
      sinon.stub(usecases, 'findPaginatedRecommendedTutorials').returns([]);
      sinon.stub(queryParamsUtils, 'extractParameters').returns(extractedParams);
      const request = {
        auth: { credentials: { userId } },
        'page[number]': '1',
        'page[size]': '200',
      };

      // when
      await userTutorialsController.findRecommended(request, hFake);

      // then
      const findPaginatedRecommendedTutorialsArgs = usecases.findPaginatedRecommendedTutorials.firstCall.args[0];
      expect(findPaginatedRecommendedTutorialsArgs).to.have.property('userId', userId);
      expect(findPaginatedRecommendedTutorialsArgs.page).to.deep.equal({
        number: '1',
        size: '200',
      });
    });
  });

  describe('#findSaved', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      const extractedParams = {
        page: {
          number: '1',
          size: '200',
        },
      };
      sinon.stub(usecases, 'findPaginatedSavedTutorials').returns([]);
      sinon.stub(queryParamsUtils, 'extractParameters').returns(extractedParams);

      const request = {
        auth: { credentials: { userId } },
        'page[number]': '1',
        'page[size]': '200',
      };

      // when
      await userTutorialsController.findSaved(request, hFake);

      // then
      const findPaginatedSavedTutorialsArgs = usecases.findPaginatedSavedTutorials.firstCall.args[0];
      expect(findPaginatedSavedTutorialsArgs).to.have.property('userId', userId);
      expect(findPaginatedSavedTutorialsArgs.page).to.deep.equal({
        number: '1',
        size: '200',
      });
    });
  });

  describe('#removeFromUser', function () {
    it('should call the repository', async function () {
      // given
      const userId = 'userId';
      const tutorialId = 'tutorialId';
      sinon.stub(userTutorialRepository, 'removeFromUser');

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.removeFromUser(request, hFake);

      // then
      const removeFromUserArgs = userTutorialRepository.removeFromUser.firstCall.args[0];
      expect(removeFromUserArgs).to.have.property('userId', userId);
      expect(removeFromUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });
});
