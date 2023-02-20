import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import { ForbiddenAccess } from '../../../../lib/domain/errors';
import findPaginatedCertificationCenterSessionSummaries from '../../../../lib/domain/usecases/find-paginated-certification-center-session-summaries';

describe('Unit | Domain | Use Cases | find-paginated-certification-center-session-summaries', function () {
  const sessionSummaryRepository = {
    findPaginatedByCertificationCenterId: () => undefined,
  };

  const userRepository = {
    getWithCertificationCenterMemberships: () => undefined,
  };

  beforeEach(function () {
    sessionSummaryRepository.findPaginatedByCertificationCenterId = sinon.stub();
    userRepository.getWithCertificationCenterMemberships = sinon.stub();
  });

  context('when user is not a member of the certification center', function () {
    it('should throw a Forbidden Access error', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter({ id: 789 });
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        user,
        certificationCenter,
      });
      user.certificationCenterMemberships = [certificationCenterMembership];
      userRepository.getWithCertificationCenterMemberships.withArgs(123).resolves(user);
      sessionSummaryRepository.findPaginatedByCertificationCenterId.rejects(new Error('should not be called'));

      // when
      const error = await catchErr(findPaginatedCertificationCenterSessionSummaries)({
        userId: 123,
        certificationCenterId: 456,
        page: 'pagination-info',
        sessionSummaryRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('User 123 is not a member of certification center 456');
    });
  });

  context('when user is a member of the certification center', function () {
    it('should return session summaries', async function () {
      // given
      const user = domainBuilder.buildUser();
      const certificationCenter = domainBuilder.buildCertificationCenter({ id: 456 });
      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        user,
        certificationCenter,
      });
      user.certificationCenterMemberships = [certificationCenterMembership];
      userRepository.getWithCertificationCenterMemberships.withArgs(123).resolves(user);
      const sessionSummaries = Symbol('session-summaries');
      const meta = Symbol('meta');
      sessionSummaryRepository.findPaginatedByCertificationCenterId
        .withArgs({
          certificationCenterId: 456,
          page: 'pagination-info',
        })
        .resolves({
          models: sessionSummaries,
          meta,
        });

      // when
      const actualResult = await findPaginatedCertificationCenterSessionSummaries({
        userId: 123,
        certificationCenterId: 456,
        page: 'pagination-info',
        sessionSummaryRepository,
        userRepository,
      });

      // then
      expect(actualResult).to.deep.equal({
        models: sessionSummaries,
        meta,
      });
    });
  });
});
