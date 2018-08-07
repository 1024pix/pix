const { sinon, expect, factory } = require('../../../test-helper');

const targetProfileController = require('../../../../lib/application/targetProfiles/target-profile-controller');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Application | Controller | Target-Profile', () => {

  describe('#findTargetProfiles', () => {

    let sandbox;
    let replyStub;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        replyStub = sandbox.stub();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call usecases with appropriated arguments', function() {
      // given
      const request = {
        auth: { credentials: { userId : connectedUserId } },
        params: { id: 'sessionId' }
      };

      // when
      const promise = targetProfileController.findTargetProfiles(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findAvailableTargetProfiles).to.have.been.called;
      })
    });

  });
});
