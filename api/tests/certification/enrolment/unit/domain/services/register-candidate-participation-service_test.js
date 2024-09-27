import { registerCandidateParticipation } from '../../../../../../src/certification/enrolment/application/services/register-candidate-participation-service.js';
import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Application | Service | register-candidate-participation', function () {
  let enrolledCandidateRepository, normalizeStringFnc;
  const candidateData = {
    firstName: 'Brice',
    lastName: 'Wine',
    birthdate: new Date(),
  };
  const sessionId = 456;
  const userId = 123;

  beforeEach(function () {
    enrolledCandidateRepository = {
      get: sinon.stub(),
    };
    normalizeStringFnc = sinon.stub();
    sinon.stub(usecases, 'reconcileCandidate');
  });

  context('when the candidate is already link to a user', function () {
    let alreadyLinkedCandidate;
    beforeEach(function () {
      alreadyLinkedCandidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        userId,
        reconciledAt: new Date('2024-09-25'),
      });
      sinon.stub(usecases, 'verifyCandidateIdentity').resolves(alreadyLinkedCandidate);
    });

    it('should not link the candidate to the given user', async function () {
      // given
      // when
      await registerCandidateParticipation({
        ...candidateData,
        userId,
        sessionId,
        normalizeStringFnc,
        enrolledCandidateRepository,
      });

      // then
      expect(usecases.verifyCandidateIdentity).to.have.been.calledWithExactly({
        ...candidateData,
        userId,
        sessionId,
        normalizeStringFnc,
      });
      expect(usecases.reconcileCandidate).to.not.have.been.called;
    });
  });

  context('when the candidate is not yet linked to a user', function () {
    let unlinkedCandidate;
    let clock;
    const now = new Date('2023-02-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      unlinkedCandidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        userId: null,
        reconciledAt: null,
      });
      sinon.stub(usecases, 'verifyCandidateIdentity').resolves(unlinkedCandidate);
      sinon.stub(usecases, 'verifyCandidateSubscriptions').resolves();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should verify candidate eligibility', async function () {
      // when
      await registerCandidateParticipation({
        ...candidateData,
        userId,
        sessionId,
        normalizeStringFnc,
        enrolledCandidateRepository,
      });

      // then
      expect(usecases.verifyCandidateSubscriptions).to.have.been.calledWithExactly({
        userId,
        candidate: unlinkedCandidate,
        sessionId,
      });
    });

    it('should link the candidate to the given user', async function () {
      // when
      await registerCandidateParticipation({
        ...candidateData,
        userId,
        sessionId,
        normalizeStringFnc,
        enrolledCandidateRepository,
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
