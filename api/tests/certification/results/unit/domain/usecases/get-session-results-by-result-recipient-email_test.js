import sinon from 'sinon';

import { getSessionResultsByResultRecipientEmail } from '../../../../../../src/certification/results/domain/usecases/get-session-results-by-result-recipient-email.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | Use Cases | get-session-results-by-result-recipient-email', function () {
  const sharedSessionRepository = { getWithCertificationCandidates: null };
  const certificationResultRepository = { findByCertificationCandidateIds: null };

  beforeEach(function () {
    sharedSessionRepository.getWithCertificationCandidates = sinon.stub();
    certificationResultRepository.findByCertificationCandidateIds = sinon.stub();
  });

  it('should return session', async function () {
    // given
    const expectedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      certificationCandidates: [],
    });
    sharedSessionRepository.getWithCertificationCandidates.withArgs({ id: 123 }).resolves(expectedSession);
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [] })
      .resolves([]);

    // when
    const { session } = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      sharedSessionRepository,
      certificationResultRepository,
    });

    // then
    expect(session).to.deepEqualInstance(expectedSession);
  });

  it('should return all certification results linked to candidates whose resultRecipientEmail matches with the one provided', async function () {
    // given
    const certificationCandidate1 = domainBuilder.buildCertificationCandidate({
      id: 456,
      resultRecipientEmail: 'notMatching@example.net',
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
    });
    const certificationCandidate2 = domainBuilder.buildCertificationCandidate({
      id: 789,
      resultRecipientEmail: 'matching@example.net',
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
    });
    const certificationCandidate3 = domainBuilder.buildCertificationCandidate({
      id: 987,
      resultRecipientEmail: 'MATCHING@example.net',
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
    });
    const certificationCandidateWithoutRecipientEmail = domainBuilder.buildCertificationCandidate({
      id: 988,
      resultRecipientEmail: null,
      subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
    });

    const expectedSession = domainBuilder.certification.sessionManagement.buildSessionManagement({
      certificationCandidates: [
        certificationCandidate1,
        certificationCandidate2,
        certificationCandidate3,
        certificationCandidateWithoutRecipientEmail,
      ],
      date: '2019-06-06',
      time: '12:05:30',
    });
    sharedSessionRepository.getWithCertificationCandidates.withArgs({ id: 123 }).resolves(expectedSession);
    const certificationResult = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [789, 987] })
      .resolves([certificationResult]);

    // when
    const { certificationResults } = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      sharedSessionRepository,
      certificationResultRepository,
    });

    // then
    expect(certificationResults).to.deepEqualArray([certificationResult]);
  });
});
