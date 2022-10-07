const { expect, sinon } = require('../../../test-helper');
const findCertificationCenterMembershipsByUser = require('../../../../lib/domain/usecases/find-certification-center-memberships-by-user');

describe('Unit | UseCase | find-certification-center-memberships-by-user', function () {
  let certificationCenterMembershipRepository;

  beforeEach(function () {
    certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
  });

  it('should return the list of the user’s certification centers', async function () {
    // given
    const certificationCenterMemberships = Symbol('A certification center membership list');
    certificationCenterMembershipRepository.findByUserId.withArgs(123).resolves(certificationCenterMemberships);

    // when
    const result = await findCertificationCenterMembershipsByUser({
      userId: 123,
      certificationCenterMembershipRepository,
    });

    // then
    expect(result).to.equal(certificationCenterMemberships);
  });
});
