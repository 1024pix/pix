import sinon from 'sinon';

import { WrongDomainExtensionForPixPlusError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { registerCandidateParticipation } from '../../../../../../src/certification/enrolment/domain/usecases/register-candidate-participation.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Usecase | register-candidate-participation', function () {
  let normalizeStringFnc;

  const candidateData = {
    firstName: 'Brice',
    lastName: 'Wine',
    birthdate: new Date(),
  };
  const sessionId = 456;

  beforeEach(function () {
    normalizeStringFnc = sinon.stub();
  });

  context('when reconciliation is ok', function () {
    context('when the candidate is already link to a user', function () {
      it('should not link the candidate to the given user', async function () {
        // given
        const userId = domainBuilder.buildUser().id;
        const alreadyLinkedCandidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          sessionId,
          userId,
          reconciledAt: new Date('2024-09-25'),
        });
        const verifyCandidateIdentityService = { verifyCandidateIdentity: () => alreadyLinkedCandidate };
        const reconcileCandidateService = { reconcileCandidate: () => '' };
        const verifyCandidateReconciliationRequirementsService = {
          verifyCandidateReconciliationRequirements: () => '',
        };

        let candidateRepository, centerRepository, sessionRepository, userRepository;
        sinon.replace(
          verifyCandidateIdentityService,
          'verifyCandidateIdentity',
          sinon.fake(verifyCandidateIdentityService.verifyCandidateIdentity),
        );
        sinon.replace(
          reconcileCandidateService,
          'reconcileCandidate',
          sinon.fake(reconcileCandidateService.reconcileCandidate),
        );
        sinon.replace(
          verifyCandidateReconciliationRequirementsService,
          'verifyCandidateReconciliationRequirements',
          sinon.fake(verifyCandidateReconciliationRequirementsService.verifyCandidateReconciliationRequirements),
        );

        // when
        await registerCandidateParticipation({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
          verifyCandidateIdentityService,
          verifyCandidateReconciliationRequirementsService,
          reconcileCandidateService,
        });

        // then
        expect(verifyCandidateIdentityService.verifyCandidateIdentity).to.have.been.calledWithExactly({
          ...candidateData,
          sessionId,
          userId,
          normalizeStringFnc,
          candidateRepository,
          centerRepository,
          sessionRepository,
          userRepository,
        });
        expect(reconcileCandidateService.reconcileCandidate).to.not.have.been.called;
        expect(verifyCandidateReconciliationRequirementsService.verifyCandidateReconciliationRequirements).to.not.have
          .been.called;
      });
    });

    context('when the candidate has a complementary subscription and is on wrong domain', function () {
      it('should throw WrongDomainExtensionForPixPlusError', async function () {
        // given
        const userId = domainBuilder.buildUser().id;
        const candidateWithComplementary = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          sessionId,
          subscription: Frameworks.DROIT,
        });
        const verifyCandidateIdentityService = { verifyCandidateIdentity: () => candidateWithComplementary };
        const reconcileCandidateService = { reconcileCandidate: () => candidateWithComplementary };
        const verifyCandidateReconciliationRequirementsService = {
          verifyCandidateReconciliationRequirements: () => '',
        };
        sinon.replace(
          reconcileCandidateService,
          'reconcileCandidate',
          sinon.fake(reconcileCandidateService.reconcileCandidate),
        );

        // when
        const error = await catchErr(registerCandidateParticipation)({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: false,
          normalizeStringFnc,
          verifyCandidateIdentityService,
          verifyCandidateReconciliationRequirementsService,
          reconcileCandidateService,
        });

        // then
        expect(error).to.be.instanceOf(WrongDomainExtensionForPixPlusError);
        expect(reconcileCandidateService.reconcileCandidate).to.not.have.been.called;
      });
    });

    context('when the candidate is not yet linked to a user', function () {
      let unlinkedCandidate;
      let userId;
      let clock;
      const now = new Date('2023-02-02');

      beforeEach(function () {
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
        userId = domainBuilder.buildUser().id;
        unlinkedCandidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
        });
      });

      afterEach(function () {
        clock.restore();
      });

      it('verifies candidate subscriptions', async function () {
        // given
        unlinkedCandidate.reconcile();

        const verifyCandidateIdentityService = { verifyCandidateIdentity: () => unlinkedCandidate };
        const reconcileCandidateService = { reconcileCandidate: () => unlinkedCandidate };
        const verifyCandidateReconciliationRequirementsService = {
          verifyCandidateReconciliationRequirements: () => '',
        };
        let placementProfileService;
        sinon.replace(
          verifyCandidateReconciliationRequirementsService,
          'verifyCandidateReconciliationRequirements',
          sinon.fake(verifyCandidateReconciliationRequirementsService.verifyCandidateReconciliationRequirements),
        );

        // when
        await registerCandidateParticipation({
          ...candidateData,
          sessionId,
          userId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
          reconcileCandidateService,
          verifyCandidateIdentityService,
          verifyCandidateReconciliationRequirementsService,
        });

        // then
        expect(
          verifyCandidateReconciliationRequirementsService.verifyCandidateReconciliationRequirements,
        ).to.have.been.calledWithExactly({
          candidate: unlinkedCandidate,
          placementProfileService,
        });
      });

      it('should link the candidate to the given user', async function () {
        const verifyCandidateIdentityService = { verifyCandidateIdentity: () => unlinkedCandidate };
        const reconcileCandidateService = { reconcileCandidate: () => unlinkedCandidate };
        const verifyCandidateReconciliationRequirementsService = {
          verifyCandidateReconciliationRequirements: () => '',
        };
        let candidateRepository, centerRepository, sessionRepository, userRepository, eventAdapter;
        sinon.replace(
          verifyCandidateIdentityService,
          'verifyCandidateIdentity',
          sinon.fake(verifyCandidateIdentityService.verifyCandidateIdentity),
        );
        sinon.replace(
          reconcileCandidateService,
          'reconcileCandidate',
          sinon.fake(reconcileCandidateService.reconcileCandidate),
        );

        // when
        await registerCandidateParticipation({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
          reconcileCandidateService,
          verifyCandidateIdentityService,
          verifyCandidateReconciliationRequirementsService,
        });

        // then
        expect(verifyCandidateIdentityService.verifyCandidateIdentity).to.have.been.calledWithExactly({
          ...candidateData,
          userId,
          sessionId,
          normalizeStringFnc,
          candidateRepository,
          centerRepository,
          sessionRepository,
          userRepository,
        });
        expect(reconcileCandidateService.reconcileCandidate).to.have.been.calledWithExactly({
          candidate: unlinkedCandidate,
          userId,
          candidateRepository,
          eventAdapter,
        });
      });
    });
  });

  context('when certificability checks fail for a certification', function () {
    it('should rollback user reconciliation', async function () {
      const userId = domainBuilder.buildUser().id;
      const certificationCandidate = domainBuilder.certification.enrolment.buildCandidate();
      const verifyCandidateIdentityService = { verifyCandidateIdentity: () => certificationCandidate };
      const reconcileCandidateService = { reconcileCandidate: () => certificationCandidate };
      const verifyCandidateReconciliationRequirementsService = {
        verifyCandidateReconciliationRequirements: sinon.fake.throws(new UserNotAuthorizedToCertifyError()),
      };

      const error = await catchErr(registerCandidateParticipation)({
        userId,
        sessionId,
        firstName: certificationCandidate.firstName,
        lastName: certificationCandidate.lastName,
        birthdate: certificationCandidate.birthdate,
        isFrenchDomainExtension: true,
        normalizeStringFnc,
        verifyCandidateIdentityService,
        reconcileCandidateService,
        verifyCandidateReconciliationRequirementsService,
      });

      expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
    });
  });
});
