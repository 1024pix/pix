import sinon from 'sinon';

import { verifyCandidateReconciliationRequirements } from '../../../../../../src/certification/enrolment/domain/usecases/verify-candidate-reconciliation-requirements.js';
import { CenterHabilitationError } from '../../../../../../src/certification/shared/domain/errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | Domain | UseCases | verify-candidate-reconciliation-requirements', function () {
  let placementProfileService, certificationCenterRepository;

  beforeEach(function () {
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };

    certificationCenterRepository = {
      getBySessionId: sinon.stub(),
    };
  });

  context('when the candidate is not certifiable', function () {
    it('throws an error', async function () {
      // given
      const userId = 123;
      const sessionId = 123;
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
        sessionId,
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

  context('when the candidate is enrolled to a double certification or complementary only', function () {
    context('when the centre has lost his habilitation', function () {
      it('throws an error', async function () {
        // given
        const userId = 123;
        const sessionId = 123;
        const reconciledAt = new Date();
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId,
          reconciledAt,
          subscription: Frameworks.DROIT,
        });

        placementProfileService.getPlacementProfile
          .withArgs({ userId: candidate.userId, limitDate: candidate.reconciledAt })
          .resolves({ isCertifiable: sinon.stub().returns(true) });

        certificationCenterRepository.getBySessionId.withArgs({ sessionId }).resolves(
          domainBuilder.buildCertificationCenter({
            habilitations: [],
          }),
        );

        // when
        const error = await catchErr(verifyCandidateReconciliationRequirements)({
          candidate,
          sessionId,
          placementProfileService,
          certificationCenterRepository,
        });

        //then
        expect(error).to.be.instanceOf(CenterHabilitationError);
      });
    });

    context('when the centre is habilitated', function () {
      it('resolves', async function () {
        // given
        const userId = 123;
        const sessionId = 123;
        const reconciledAt = new Date();
        const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification({
          label: 'Pix+Droit',
          key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        });
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId,
          reconciledAt,
          subscription: complementaryCertification.key,
        });

        placementProfileService.getPlacementProfile
          .withArgs({ userId: candidate.userId, limitDate: candidate.reconciledAt })
          .resolves({ isCertifiable: sinon.stub().returns(true) });

        certificationCenterRepository.getBySessionId.withArgs({ sessionId }).resolves(
          domainBuilder.buildCertificationCenter({
            habilitations: [
              domainBuilder.certification.enrolment.buildHabilitation({
                complementaryCertificationId: complementaryCertification.id,
                key: complementaryCertification.key,
                label: complementaryCertification.label,
              }),
            ],
          }),
        );

        // when
        // then
        return expect(
          verifyCandidateReconciliationRequirements({
            candidate,
            sessionId,
            placementProfileService,
            certificationCenterRepository,
          }),
        ).to.be.fulfilled;
      });
    });
  });
});
