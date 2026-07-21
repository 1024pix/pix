import sinon from 'sinon';

import { WrongDomainExtensionForPixPlusError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
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
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    normalizeStringFnc = sinon.stub();
  });
  context('when reconciliation is ok', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'reconcileCandidate');
      sinon.stub(usecases, 'verifyCandidateReconciliationRequirements');
    });

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
        sinon.stub(usecases, 'verifyCandidateIdentity').resolves(alreadyLinkedCandidate);

        // when
        await usecases.registerCandidateParticipation({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
        });

        // then
        expect(usecases.verifyCandidateIdentity).to.have.been.calledWithExactly({
          ...candidateData,
          sessionId,
          userId,
          normalizeStringFnc,
        });
        expect(usecases.reconcileCandidate).to.not.have.been.called;
        expect(usecases.verifyCandidateReconciliationRequirements).to.not.have.been.called;
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
        sinon.stub(usecases, 'verifyCandidateIdentity').resolves(candidateWithComplementary);

        // when
        const error = await catchErr(usecases.registerCandidateParticipation)({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: false,
          normalizeStringFnc,
        });

        // then
        expect(error).to.be.instanceOf(WrongDomainExtensionForPixPlusError);
        expect(usecases.reconcileCandidate).to.not.have.been.called;
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
        sinon.stub(usecases, 'verifyCandidateIdentity').resolves(unlinkedCandidate);
        usecases.verifyCandidateReconciliationRequirements.resolves();
      });

      afterEach(function () {
        clock.restore();
      });

      it('verifies candidate subscriptions', async function () {
        // given
        unlinkedCandidate.reconcile();
        usecases.reconcileCandidate.resolves(unlinkedCandidate);

        // when
        await usecases.registerCandidateParticipation({
          ...candidateData,
          sessionId,
          userId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
        });

        // then
        expect(usecases.verifyCandidateReconciliationRequirements).to.have.been.calledWithExactly({
          candidate: unlinkedCandidate,
        });
      });

      it('should link the candidate to the given user', async function () {
        // when
        await usecases.registerCandidateParticipation({
          ...candidateData,
          userId,
          sessionId,
          isFrenchDomainExtension: true,
          normalizeStringFnc,
        });

        // then
        expect(usecases.verifyCandidateIdentity).to.have.been.calledWithExactly({
          ...candidateData,
          userId,
          sessionId,
          normalizeStringFnc,
        });
        expect(usecases.reconcileCandidate).to.have.been.calledWithExactly({
          candidate: unlinkedCandidate,
          userId,
        });
      });
    });
  });

  context('when certificability checks fail for a certification', function () {
    it('should rollback user reconciliation', async function () {
      const userId = domainBuilder.buildUser().id;
      const certificationCandidate = domainBuilder.certification.enrolment.buildCandidate();

      sinon.stub(usecases, 'verifyCandidateIdentity').resolves(certificationCandidate);

      sinon.stub(usecases, 'reconcileCandidate');
      sinon.stub(usecases, 'verifyCandidateReconciliationRequirements').throws(new UserNotAuthorizedToCertifyError());

      const error = await catchErr(usecases.registerCandidateParticipation)({
        userId,
        sessionId,
        firstName: certificationCandidate.firstName,
        lastName: certificationCandidate.lastName,
        birthdate: certificationCandidate.birthdate,
        isFrenchDomainExtension: true,
        normalizeStringFnc,
      });

      expect(error).to.be.an.instanceOf(UserNotAuthorizedToCertifyError);
    });
  });
});
