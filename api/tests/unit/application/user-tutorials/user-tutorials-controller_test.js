import { sinon, expect, hFake } from '../../../test-helper';
import userTutorialsController from '../../../../lib/application/user-tutorials/user-tutorials-controller';
import usecases from '../../../../lib/domain/usecases';
import userSavedTutorialSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-saved-tutorial-serializer';
import userSavedTutorialRepository from '../../../../lib/infrastructure/repositories/user-saved-tutorial-repository';
import queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils';
import requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils';
import tutorialSerializer from '../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer';

describe('Unit | Controller | User-tutorials', function () {
  describe('#add', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });
      sinon.stub(userSavedTutorialSerializer, 'deserialize').returns({});

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
        sinon.stub(userSavedTutorialSerializer, 'deserialize').returns({ skillId });

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
        expect(userSavedTutorialSerializer.deserialize).to.have.been.calledWith(request.payload);
      });
    });
  });

  describe('#find', function () {
    it('should call the expected usecase and return serialized tutorials', async function () {
      // given
      const userId = 'userId';
      const request = {
        auth: { credentials: { userId } },
        'filter[competences]': 'competence1,competence2',
        'filter[type]': 'recommended',
        'page[number]': '1',
        'page[size]': '200',
        query: {},
      };

      const expectedLocale = Symbol('locale');
      const expectedFilters = Symbol('filters');
      const expectedPage = Symbol('page');
      const expectedTutorials = Symbol('tutorials');
      const extractedParams = {
        page: expectedPage,
        filter: expectedFilters,
      };
      const returnedTutorials = Symbol('returned-tutorials');
      const returnedMeta = Symbol('returned-meta');
      sinon.stub(requestResponseUtils, 'extractLocaleFromRequest').withArgs(request).returns(expectedLocale);
      sinon.stub(queryParamsUtils, 'extractParameters').withArgs(request.query).returns(extractedParams);
      sinon.stub(usecases, 'findPaginatedFilteredTutorials').resolves({
        tutorials: returnedTutorials,
        meta: returnedMeta,
      });
      sinon.stub(tutorialSerializer, 'serialize').returns(expectedTutorials);

      // when
      const result = await userTutorialsController.find(request);

      // then
      expect(tutorialSerializer.serialize).to.have.been.calledWithExactly(returnedTutorials, returnedMeta);
      expect(usecases.findPaginatedFilteredTutorials).to.have.been.calledWithExactly({
        userId,
        filters: expectedFilters,
        page: expectedPage,
        locale: expectedLocale,
      });
      expect(result).to.equal(expectedTutorials);
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
