const { domainBuilder, expect, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | find-certification-center-memberships-by-certification-center', () => {

  const certificationCenterId = 1;
  const certificationCenterMemberships = [domainBuilder.buildCertificationCenterMembership()];

  let certificationCenterMembershipRepository;

  beforeEach(() => {
    certificationCenterMembershipRepository = {
      findByCertificationCenterId: sinon.stub(),
    };
    certificationCenterMembershipRepository.findByCertificationCenterId.resolves(certificationCenterMemberships);
  });

  it('should result certification-center-memberships by certification center id', async () => {
    // given

    // when
    const foundCertificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterMembershipRepository.findByCertificationCenterId)
      .to.have.been.calledWith(certificationCenterId);
    expect(foundCertificationCenterMemberships).to.deep.equal(certificationCenterMemberships);
  });

});
