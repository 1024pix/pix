import { certificationCenterMembershipController } from '../../../../../src/team/application/certification-center-membership/certification-center-membership.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Application | Controller | CertificationCenterMembership', function () {
  describe('#findCertificationCenterMemberships', function () {
    it('returns the serialized membership', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        certificationCenter,
        user,
      });
      const serializedCertificationCenterMembership = Symbol('certification center membership serialized');

      const request = {
        params: {
          certificationCenterId: certificationCenter.id,
        },
      };

      sinon
        .stub(usecases, 'findCertificationCenterMembershipsByCertificationCenter')
        .withArgs({
          certificationCenterId: certificationCenter.id,
        })
        .resolves(certificationCenterMembership);

      const certificationCenterMembershipSerializerStub = {
        serializeMembers: sinon.stub(),
      };
      certificationCenterMembershipSerializerStub.serializeMembers
        .withArgs(certificationCenterMembership)
        .returns(serializedCertificationCenterMembership);

      // when
      const response = await certificationCenterMembershipController.findCertificationCenterMemberships(
        request,
        hFake,
        {
          certificationCenterMembershipSerializer: certificationCenterMembershipSerializerStub,
        },
      );

      // then
      expect(usecases.findCertificationCenterMembershipsByCertificationCenter).to.have.been.calledOnce;
      expect(response).equal(serializedCertificationCenterMembership);
    });
  });
});
