import { expect, hFake, sinon } from '../../../../test-helper.js';

import { attachTargetProfileController } from '../../../../../src/certification/complementary-certification/application/attach-target-profile-controller.js';
import { usecases } from '../../../../../src/certification/complementary-certification/domain/usecases/index.js';

describe('Unit | Application | Certification | ComplementaryCertification | attach-target-profile-controller', function () {
  describe('#attachTargetProfile', function () {
    context('when there is no notification', function () {
      it('should call the usecase and serialize the response', async function () {
        // given
        const request = {
          payload: Symbol('args'),
          auth: { credentials: { userId: 99 } },
          params: { complementaryCertificationId: 101 },
        };

        const complementaryCertification = Symbol('certification');
        const complementaryCertificationBadges = Symbol('complementaryCertificationBadges');

        sinon.stub(usecases, 'getComplementaryCertificationForTargetProfileAttachmentRepository');
        sinon.stub(usecases, 'attachBadges');
        sinon.stub(usecases, 'sendTargetProfileNotifications');
        const complementaryCertificationBadgeSerializerStub = {
          deserialize: sinon.stub(),
        };

        usecases.getComplementaryCertificationForTargetProfileAttachmentRepository.resolves(complementaryCertification);
        complementaryCertificationBadgeSerializerStub.deserialize.withArgs(request.payload).returns({
          targetProfileId: 1,
          notifyOrganizations: false,
          complementaryCertificationBadges,
        });

        const dependencies = {
          complementaryCertificationBadgeSerializer: complementaryCertificationBadgeSerializerStub,
        };

        // when
        const result = await attachTargetProfileController.attachTargetProfile(request, hFake, dependencies);

        // then
        expect(result.statusCode).to.equal(204);
        expect(usecases.attachBadges).to.have.been.calledWith({
          userId: 99,
          complementaryCertification,
          targetProfileIdToDetach: 1,
          complementaryCertificationBadgesToAttachDTO: complementaryCertificationBadges,
        });
        expect(usecases.sendTargetProfileNotifications).not.to.have.been.called;
      });
    });

    context('when there are notifications', function () {
      it('should call the usecase and serialize the response', async function () {
        // given
        const request = {
          payload: Symbol('args'),
          auth: { credentials: { userId: 99 } },
          params: { complementaryCertificationId: 101 },
        };

        const complementaryCertification = Symbol('certification');
        const complementaryCertificationBadges = Symbol('complementaryCertificationBadges');

        sinon.stub(usecases, 'getComplementaryCertificationForTargetProfileAttachmentRepository');
        sinon.stub(usecases, 'attachBadges');
        sinon.stub(usecases, 'sendTargetProfileNotifications');
        const complementaryCertificationBadgeSerializerStub = {
          deserialize: sinon.stub(),
        };

        usecases.getComplementaryCertificationForTargetProfileAttachmentRepository.resolves(complementaryCertification);
        complementaryCertificationBadgeSerializerStub.deserialize.withArgs(request.payload).returns({
          targetProfileId: 1,
          notifyOrganizations: true,
          complementaryCertificationBadges,
        });

        const dependencies = {
          complementaryCertificationBadgeSerializer: complementaryCertificationBadgeSerializerStub,
        };

        // when
        const result = await attachTargetProfileController.attachTargetProfile(request, hFake, dependencies);

        // then
        expect(result.statusCode).to.equal(204);
        expect(usecases.attachBadges).to.have.been.calledWith({
          userId: 99,
          complementaryCertification,
          targetProfileIdToDetach: 1,
          complementaryCertificationBadgesToAttachDTO: complementaryCertificationBadges,
        });
        expect(usecases.sendTargetProfileNotifications).to.have.been.calledWith({
          targetProfileIdToDetach: 1,
          complementaryCertification,
        });
      });
    });
  });
});
