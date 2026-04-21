import sinon from 'sinon';

import { findPaginatedCertificationCenterSessionSummaries } from '../../../../../../src/certification/session-management/domain/usecases/find-paginated-certification-center-session-summaries.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | find-paginated-certification-center-session-summaries', function () {
  const sessionSummaryRepository = {
    findPaginatedByCertificationCenterId: () => undefined,
  };

  const userRepository = {
    isUserAllowedToAccessCertificationCenter: () => undefined,
  };

  beforeEach(function () {
    sessionSummaryRepository.findPaginatedByCertificationCenterId = sinon.stub();
    userRepository.isUserAllowedToAccessCertificationCenter = sinon.stub();
  });

  context('when user is not a member of the certification center', function () {
    it('should throw a Forbidden Access error', async function () {
      // given
      userRepository.isUserAllowedToAccessCertificationCenter.withArgs(123, 456).resolves(false);
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
      userRepository.isUserAllowedToAccessCertificationCenter.withArgs(123, 456).resolves(true);
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
