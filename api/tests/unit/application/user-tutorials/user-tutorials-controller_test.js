const { sinon, expect, hFake } = require('../../../test-helper');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');
const usecases = require('../../../../lib/domain/usecases');
const userTutorialSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');
const userSavedTutorialRepository = require('../../../../lib/infrastructure/repositories/user-saved-tutorial-repository');
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

  describe('#findRecommended', function () {
    it('should call the expected usecase', async function () {
      // given
      const userId = 'userId';
      const extractedParams = {
        page: {
          number: '1',
          size: '200',
        },
        filter: {
          competences: ['competence1', 'competence2'],
        },
      };
      const headers = {
        'accept-language': 'fr',
      };
      sinon.stub(usecases, 'findPaginatedFilteredRecommendedTutorials').returns([]);
      sinon.stub(queryParamsUtils, 'extractParameters').returns(extractedParams);
      const request = {
        auth: { credentials: { userId } },
        'filter[competences]': 'competence1,competence2',
        'page[number]': '1',
        'page[size]': '200',
        headers,
      };

      // when
      await userTutorialsController.findRecommended(request, hFake);

      // then
      const findPaginatedRecommendedTutorialsArgs =
        usecases.findPaginatedFilteredRecommendedTutorials.firstCall.args[0];
      expect(findPaginatedRecommendedTutorialsArgs).to.have.property('userId', userId);
      expect(findPaginatedRecommendedTutorialsArgs.filters).to.deep.equal({
        competences: ['competence1', 'competence2'],
      });
      expect(findPaginatedRecommendedTutorialsArgs.page).to.deep.equal({
        number: '1',
        size: '200',
      });
      expect(findPaginatedRecommendedTutorialsArgs.locale).to.equal('fr');
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
        filter: {
          competences: ['competence1', 'competence2'],
        },
      };
      sinon.stub(usecases, 'findPaginatedFilteredSavedTutorials').returns([]);
      sinon.stub(queryParamsUtils, 'extractParameters').returns(extractedParams);

      const request = {
        auth: { credentials: { userId } },
        'filter[competences]': 'competence1,competence2',
        'page[number]': '1',
        'page[size]': '200',
      };

      // when
      await userTutorialsController.findSaved(request, hFake);

      // then
      const findPaginatedFilteredSavedTutorialsArgs = usecases.findPaginatedFilteredSavedTutorials.firstCall.args[0];
      expect(findPaginatedFilteredSavedTutorialsArgs).to.have.property('userId', userId);
      expect(findPaginatedFilteredSavedTutorialsArgs.filters).to.deep.equal({
        competences: ['competence1', 'competence2'],
      });
      expect(findPaginatedFilteredSavedTutorialsArgs.page).to.deep.equal({
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
      sinon.stub(userSavedTutorialRepository, 'removeFromUser');

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.removeFromUser(request, hFake);

      // then
      const removeFromUserArgs = userSavedTutorialRepository.removeFromUser.firstCall.args[0];
      expect(removeFromUserArgs).to.have.property('userId', userId);
      expect(removeFromUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });
});
