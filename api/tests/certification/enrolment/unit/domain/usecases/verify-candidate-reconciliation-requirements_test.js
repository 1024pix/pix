import sinon from 'sinon';

import { verifyCandidateReconciliationRequirements } from '../../../../../../src/certification/enrolment/domain/usecases/verify-candidate-reconciliation-requirements.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | Domain | UseCases | verify-candidate-reconciliation-requirements', function () {
  let placementProfileService;

  beforeEach(function () {
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };
  });

  context('when the candidate is not certifiable', function () {
    it('throws an error', async function () {
      // given
      const userId = 123;
      const reconciledAt = new Date();
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId,
        reconciledAt,
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      });

      placementProfileService.getPlacementProfile
        .withArgs({ userId: candidate.userId, limitDate: candidate.reconciledAt })
        .resolves({ isCertifiable: sinon.stub().returns(false) });

      // when
      const error = await catchErr(verifyCandidateReconciliationRequirements)({
        candidate,
        placementProfileService,
      });

      //then
      expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
    });
  });

  context('when the candidate is certifiable', function () {
    it('resolves', async function () {
      // given
      const userId = 123;
      const reconciledAt = new Date();
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId,
        reconciledAt,
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      });

      placementProfileService.getPlacementProfile
        .withArgs({ userId: candidate.userId, limitDate: candidate.reconciledAt })
        .resolves({ isCertifiable: sinon.stub().returns(true) });

      // when
      // then
      return expect(
        verifyCandidateReconciliationRequirements({
          candidate,
          placementProfileService,
        }),
      ).to.be.fulfilled;
    });
  });
});
