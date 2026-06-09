import sinon from 'sinon';

import { userTutorialsController } from '../../../../../src/devcomp/application/user-tutorials/user-tutorials-controller.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | User-tutorials', function () {
  describe('#add', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialToUser').returns({ id: 'userTutorialId' });

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

        const request = {
          auth: { credentials: { userId } },
          params: { tutorialId },
          payload: { data: { attributes: { 'skill-id': 'skillId' } } },
        };

        // when
        const result = await userTutorialsController.add(request, hFake);

        // then
        const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
        expect(addTutorialToUserArgs).to.have.property('userId', userId);
        expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
        expect(addTutorialToUserArgs).to.have.property('skillId', skillId);
        expect(result.source.data).to.deep.equal({ id: 'userTutorialId', type: 'user-saved-tutorials' });
      });
    });
  });

  describe('#find', function () {
    it('should call the expected usecase and return serialized tutorials', async function () {
      // given
      const userId = 'userId';
      const locale = 'fr-FR';
      const request = {
        auth: { credentials: { userId } },
        query: {
          filter: {
            competences: 'competence1,competence2',
            type: 'recommended',
          },
          page: {
            number: '1',
            size: '200',
          },
        },
        state: { locale },
      };

      const expectedFilters = request.query.filter;
      const expectedPage = request.query.page;

      const returnedTutorials = [{ id: 'tuto 1' }, { id: 'tuto 2' }];
      const returnedMeta = { page: 1 };
      sinon.stub(usecases, 'findPaginatedFilteredTutorials').resolves({
        tutorials: returnedTutorials,
        meta: returnedMeta,
      });

      // when
      const result = await userTutorialsController.find(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredTutorials).to.have.been.calledWithExactly({
        userId,
        filters: expectedFilters,
        page: expectedPage,
        lang: 'fr',
      });
      expect(result).to.deep.equal({
        data: [
          { id: 'tuto 1', type: 'tutorials' },
          { id: 'tuto 2', type: 'tutorials' },
        ],
        meta: { page: 1 },
      });
    });
  });

  describe('#removeFromUser', function () {
    it('should call the repository', async function () {
      // given
      const userId = 'userId';
      const tutorialId = 'tutorialId';
      const userSavedTutorialRepository = {
        removeFromUser: sinon.stub(),
      };

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
      };

      // when
      await userTutorialsController.removeFromUser(request, hFake, { userSavedTutorialRepository });

      // then
      const removeFromUserArgs = userSavedTutorialRepository.removeFromUser.firstCall.args[0];
      expect(removeFromUserArgs).to.have.property('userId', userId);
      expect(removeFromUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });
});
