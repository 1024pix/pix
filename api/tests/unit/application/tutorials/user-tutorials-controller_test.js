const { sinon, expect, hFake } = require('../../../test-helper');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | User-tutorials', function() {
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
      await userTutorialsController.addToUser(request, hFake);

      // then
      const addTutorialToUserArgs = usecases.addTutorialToUser.firstCall.args[0];
      expect(addTutorialToUserArgs).to.have.property('userId', userId);
      expect(addTutorialToUserArgs).to.have.property('tutorialId', tutorialId);
    });
  });

});
