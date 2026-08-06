import sinon from 'sinon';

import { findPaginatedFilteredCertificationCenterSessionSummaries } from '../../../../../../src/certification/session-management/domain/usecases/find-paginated-filtered-certification-center-session-summaries.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | find-paginated-certification-center-session-summaries', function () {
  const sessionSummaryRepository = {
    findPaginatedFilteredByCertificationCenterId: () => undefined,
  };

  const certificationCenterMembershipRepository = {
    isMemberOfCertificationCenter: () => undefined,
  };

  beforeEach(function () {
    sessionSummaryRepository.findPaginatedFilteredByCertificationCenterId = sinon.stub();
    certificationCenterMembershipRepository.isMemberOfCertificationCenter = sinon.stub();
  });

  context('when user is not a member of the certification center', function () {
    it('should throw a Forbidden Access error', async function () {
      // given
      certificationCenterMembershipRepository.isMemberOfCertificationCenter
        .withArgs({ userId: 123, certificationCenterId: 456 })
        .resolves(false);
      sessionSummaryRepository.findPaginatedFilteredByCertificationCenterId.rejects(new Error('should not be called'));

      // when
      const error = await catchErr(findPaginatedFilteredCertificationCenterSessionSummaries)({
        userId: 123,
        certificationCenterId: 456,
        page: 'pagination-info',
        sessionSummaryRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('User 123 is not a member of certification center 456');
    });
  });

  context('when user is a member of the certification center', function () {
    it('should return session summaries', async function () {
      // given
      certificationCenterMembershipRepository.isMemberOfCertificationCenter
        .withArgs({ userId: 123, certificationCenterId: 456 })
        .resolves(true);
      const sessionSummaries = Symbol('session-summaries');
      const meta = Symbol('meta');
      sessionSummaryRepository.findPaginatedFilteredByCertificationCenterId
        .withArgs({
          certificationCenterId: 456,
          page: 'pagination-info',
          filters: { sessionId: 1 },
        })
        .resolves({
          models: sessionSummaries,
          meta,
        });

      // when
      const actualResult = await findPaginatedFilteredCertificationCenterSessionSummaries({
        userId: 123,
        certificationCenterId: 456,
        filters: { sessionId: 1 },
        page: 'pagination-info',
        sessionSummaryRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(actualResult).to.deep.equal({
        models: sessionSummaries,
        meta,
      });
    });
  });
});
