import { expect, sinon, domainBuilder } from '../../../test-helper';
import getSessionResultsByResultRecipientEmail from '../../../../lib/domain/usecases/get-session-results-by-result-recipient-email';

describe('Unit | Domain | Use Cases | get-session-results-by-result-recipient-email', function () {
  const sessionRepository = { getWithCertificationCandidates: null };
  const certificationResultRepository = { findByCertificationCandidateIds: null };

  beforeEach(function () {
    sessionRepository.getWithCertificationCandidates = sinon.stub();
    certificationResultRepository.findByCertificationCandidateIds = sinon.stub();
  });

  it('should return session', async function () {
    // given
    const expectedSession = domainBuilder.buildSession({
      certificationCandidates: [],
    });
    sessionRepository.getWithCertificationCandidates.withArgs(123).resolves(expectedSession);
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [] })
      .resolves([]);

    // when
    const { session } = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      sessionRepository,
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
    });
    const certificationCandidate2 = domainBuilder.buildCertificationCandidate({
      id: 789,
      resultRecipientEmail: 'matching@example.net',
    });
    const expectedSession = domainBuilder.buildSession({
      certificationCandidates: [certificationCandidate1, certificationCandidate2],
      date: '2019-06-06',
      time: '12:05:30',
    });
    sessionRepository.getWithCertificationCandidates.withArgs(123).resolves(expectedSession);
    const certificationResult = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [789] })
      .resolves([certificationResult]);

    // when
    const { certificationResults } = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      sessionRepository,
      certificationResultRepository,
    });

    // then
    expect(certificationResults).to.deepEqualArray([certificationResult]);
  });
});
