import { expect, sinon } from '../../../test-helper';
import findCertificationCenterMembershipsByUser from '../../../../lib/domain/usecases/find-certification-center-memberships-by-user';

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
