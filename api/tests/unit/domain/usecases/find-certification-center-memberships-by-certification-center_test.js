import { domainBuilder, expect, sinon } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';

describe('Unit | UseCase | find-certification-center-memberships-by-certification-center', function () {
  it('should result certification-center-memberships by certification center id', async function () {
    // given
    const certificationCenterId = 1;
    const certificationCenterMemberships = [domainBuilder.buildCertificationCenterMembership()];
    const certificationCenterMembershipRepository = { findActiveByCertificationCenterIdSortedById: sinon.stub() };
    certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById.resolves(
      certificationCenterMemberships
    );

    // when
    const foundCertificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById).to.have.been.calledWith(
      { certificationCenterId }
    );
    expect(foundCertificationCenterMemberships).to.deep.equal(certificationCenterMemberships);
  });
});
