const { expect, sinon, catchErr } = require('../../../test-helper');
const findPaginatedSessionsForCertificationCenter = require('../../../../lib/domain/usecases/find-sessions-for-certification-center');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-paginated-sessions-for-certification-center', () => {
  const userRepository = {
    getWithCertificationCenterMemberships: sinon.stub(),
  };
  const sessionRepository = {
    findPaginatedSessions: sinon.stub(),
  };
  const user = {
    hasAccessToCertificationCenter: sinon.stub(),
  };
  const userId = 'user id';
  const certificationCenterId = 'certification center id';
  const filter = Symbol('filter');
  const sessions = 'some sessions';

  let page;

  beforeEach(() => {
    page = { number: 1, size: 50 };
    userRepository.getWithCertificationCenterMemberships.withArgs(userId).resolves(user);
    sessionRepository.findPaginatedSessions.withArgs({ certificationCenterId, filter, page }).resolves(sessions);
  });

  it('should throw a forbidden access error when the user does not have access to the center', async () => {
    // given,
    user.hasAccessToCertificationCenter.returns(false);
    // when
    const error = await catchErr(findPaginatedSessionsForCertificationCenter)({ userId, user, userRepository });
    // then
    expect(error).to.be.instanceOf(ForbiddenAccess);
  });

  it('should return the paginated sessions', async () => {
    // given
    user.hasAccessToCertificationCenter.returns(true);
    // when
    const res = await findPaginatedSessionsForCertificationCenter({
      userId, userRepository, sessionRepository, certificationCenterId, filter, page
    });
    // then
    expect(res).to.deep.equal(sessions);
  });

  it('should replace any too low page size value by the minimum allowed', async () => {
    // given
    page.size = 1;
    user.hasAccessToCertificationCenter.returns(true);
    // when
    await findPaginatedSessionsForCertificationCenter({
      userId, userRepository, sessionRepository, certificationCenterId, filter, page
    });
    // then
    expect(sessionRepository.findPaginatedSessions).to.have.been.calledWithExactly({
      certificationCenterId,
      filter,
      page: { number: 1, size: 10 },
    });
  });

  it('should replace any too high page size value by the maximum allowed', async () => {
    // given
    page.size = 100000;
    user.hasAccessToCertificationCenter.returns(true);
    // when
    await findPaginatedSessionsForCertificationCenter({
      userId, userRepository, sessionRepository, certificationCenterId, filter, page
    });
    // then
    expect(sessionRepository.findPaginatedSessions).to.have.been.calledWithExactly({
      certificationCenterId,
      filter,
      page: { number: 1, size: 100},
    });
  });

});
