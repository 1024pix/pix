import sinon from 'sinon';

import { attestationController } from '../../../../src/profile/application/attestation-controller.js';
import { usecases } from '../../../../src/profile/domain/usecases/index.js';
import { FRENCH_FRANCE } from '../../../../src/shared/domain/services/locale-service.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Profile | Unit | Controller | attestation-controller', function () {
  describe('#getAll', function () {
    it('should call the expected usecase and serializer', async function () {
      // given
      const attestations = Symbol('attestations');
      const serializerResult = Symbol('serializerResult');
      const attestationAdminSerializer = { serialize: sinon.stub().withArgs(attestations).returns(serializerResult) };
      sinon.stub(usecases, 'getAllAttestations').resolves(attestations);

      // when
      const result = await attestationController.getAll({}, hFake, { attestationAdminSerializer });

      // then
      expect(usecases.getAllAttestations).to.have.been.calledOnce;
      expect(attestationAdminSerializer.serialize).to.have.been.calledWithExactly(attestations);
      expect(result).to.equal(serializerResult);
    });
  });

  describe('#getUserAttestation', function () {
    it('should call the expected usecase and serializer', async function () {
      // given
      const pdfWithFormSerializerStub = { serializeStream: sinon.stub() };
      sinon.stub(usecases, 'getAttestationDataForUsers');

      const userId = '12';
      const locale = FRENCH_FRANCE;
      const attestationKey = 'key';

      const request = {
        params: {
          userId,
          attestationKey,
        },
      };
      sinon.stub(hFake, 'response');
      const template = Symbol('template');
      hFake.response.callThrough();

      const expectedUsecaseResponse = { data: Symbol('data'), template };
      const expectedBuffer = Symbol('expectedBuffer');

      usecases.getAttestationDataForUsers
        .withArgs({ attestationKey, userIds: [userId], locale })
        .resolves(expectedUsecaseResponse);
      pdfWithFormSerializerStub.serializeStream
        .withArgs(template, expectedUsecaseResponse.data)
        .resolves(expectedBuffer);

      // when
      await attestationController.getUserAttestation(request, hFake, {
        pdfWithFormSerializer: pdfWithFormSerializerStub,
      });

      // then
      expect(hFake.response).to.have.been.calledWith(expectedBuffer);
    });
  });

  describe('#getUserAttestationsDetails', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getProfileRewardsByUserId').rejects();
      sinon.stub(usecases, 'getAttestationDetails').rejects();
    });

    it('should call the expected usecase', async function () {
      // given
      const userId = 12;
      const profileRewards = Symbol('profileReward');
      const attestationDetails = Symbol('attestationDetail');
      const serializerReturns = Symbol('result_serializer');
      const dependencies = {
        attestationSerializer: {
          serialize: sinon.stub(),
        },
      };

      usecases.getProfileRewardsByUserId.withArgs({ userId }).resolves(profileRewards);
      usecases.getAttestationDetails.withArgs({ profileRewards }).resolves(attestationDetails);
      dependencies.attestationSerializer.serialize.withArgs(attestationDetails).returns(serializerReturns);
      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
      };

      // when
      const result = await attestationController.getUserAttestationsDetails(request, hFake, dependencies);

      // then
      expect(usecases.getProfileRewardsByUserId).to.have.been.calledWithExactly({ userId });
      expect(usecases.getAttestationDetails).to.have.been.calledWithExactly({ profileRewards });
      expect(dependencies.attestationSerializer.serialize).to.have.been.calledWithExactly(attestationDetails);
      expect(result).to.be.equals(serializerReturns);
    });
  });
});
