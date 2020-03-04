const { sinon, expect, hFake } = require('../../../test-helper');
const tutorialsController = require('../../../../lib/application/tutorials/tutorials-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | Tutorials', function() {
  describe('#addToUser', function() {
    it('should call the expected usecase', async function() {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialToUser');

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId }
      };

      // when
      await tutorialsController.addToUser(request, hFake);

      // then
      const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
      expect(addTutorialToUserArgs).to.have.property('userId', userId);
      expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });

});
