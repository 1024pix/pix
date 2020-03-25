const { expect, sinon, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-sessions-for-certification-center', () => {

  const userId = 'userId';
  const certificationCenterId = 'certificationCenterId';
  const sessions = 'sessions list';
  const sessionRepository = {
    findByCertificationCenterId: sinon.stub(),
  };
  const certificationCenterMembershipRepository = {
    doesUserHaveMembershipToCertificationCenter: sinon.stub(),
  };

  it('should return sessions of the certificationCenter', async () => {
    // given
    certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter.withArgs(userId, certificationCenterId).resolves(true);
    sessionRepository.findByCertificationCenterId.withArgs(certificationCenterId).resolves(sessions);

    // when
    const sessionsFound = await usecases.findSessionsForCertificationCenter({ userId, certificationCenterId, certificationCenterMembershipRepository, sessionRepository });

    // then
    expect(sessionsFound).to.be.deep.equal(sessions);
  });

  it('should throw a forbidden error if user is not a member of the given certification center', async () => {
    // given
    certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter.withArgs(userId, certificationCenterId).resolves(false);
    sessionRepository.findByCertificationCenterId.withArgs(certificationCenterId).resolves(sessions);

    // when
    const error = await catchErr(usecases.findSessionsForCertificationCenter)({ userId, certificationCenterId, certificationCenterMembershipRepository, sessionRepository });

    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
    expect(error.message).to.equal(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  });
});
