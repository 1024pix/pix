const { sinon, expect, factory } = require('../../../test-helper');

const targetProfileController = require('../../../../lib/application/targetProfiles/target-profile-controller');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const targetProfileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const usecases = require('../../../../lib/domain/usecases');

const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Application | Controller | Target-Profile', () => {

  describe('#findTargetProfiles', () => {

    let sandbox;
    let request;
    let codeStub;
    let replyStub;
    const connectedUserId = 1;
    let organizationId = '145'

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId }
      };
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
      sandbox.stub(usecases, 'findAvailableTargetProfiles').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call usecases with appropriated arguments', () => {
      // when
      const promise = targetProfileController.findTargetProfiles(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findAvailableTargetProfiles).to.have.been.calledOnce;
        expect(usecases.findAvailableTargetProfiles).to.have.been.calledWith({
          organizationId: organizationId,
          targetProfileRepository
        });
      });
    });

    context('success cases', () => {

      let foundTargetProfiles;

      beforeEach(() => {
        // given
        foundTargetProfiles = [factory.buildTargetProfile()];
        usecases.findAvailableTargetProfiles.resolves(foundTargetProfiles);
        sandbox.stub(targetProfileSerializer, 'serialize');
      });

      it('should serialize the array of target profile', () => {
        // when
        const promise = targetProfileController.findTargetProfiles(request, replyStub);

        // then
        return promise.then(() => {
          expect(targetProfileSerializer.serialize).to.have.been.calledWith(foundTargetProfiles);
        });
      });

      it('should reply 200 with serialized target profiles', () => {
        // given
        const serializedTargetProfiles = {};
        targetProfileSerializer.serialize.returns(serializedTargetProfiles);

        // when
        const promise = targetProfileController.findTargetProfiles(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(serializedTargetProfiles);
          expect(codeStub).to.have.been.calledWith(200);
        });
      });

    });

    context('error cases', () => {

      beforeEach(() => {
        sandbox.stub(logger, 'error');
      });

      it('should log the error and reply with 500 error', () => {
        // given
        const error = new Error();
        usecases.findAvailableTargetProfiles.rejects(error);

        // when
        const promise = targetProfileController.findTargetProfiles(request, replyStub);

        // then
        return promise.then(() => {
          expect(logger.error).to.have.been.called;
          expect(codeStub).to.have.been.calledWith(500);
        });
      });
    });
  });
});
