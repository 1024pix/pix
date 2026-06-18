import sinon from 'sinon';

import { ResultRecipient } from '../../../../../../src/certification/results/domain/read-models/ResultRecipient.js';
import { getSessionResultsByResultRecipientEmail } from '../../../../../../src/certification/results/domain/usecases/get-session-results-by-result-recipient-email.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | Use Cases | get-session-results-by-result-recipient-email', function () {
  let resultRecipientRepository;
  let certificationResultRepository;

  beforeEach(function () {
    resultRecipientRepository = { get: sinon.stub() };
    certificationResultRepository = { findByCertificationCandidateIds: sinon.stub() };
  });

  it('should return certification results for the matching recipient', async function () {
    // given
    const resultRecipient = new ResultRecipient({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      candidateIds: [789, 987],
    });
    resultRecipientRepository.get
      .withArgs({ sessionId: 123, resultRecipientEmail: 'matching@example.net' })
      .resolves(resultRecipient);

    const certificationResult = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [789, 987] })
      .resolves([certificationResult]);

    // when
    const result = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'matching@example.net',
      resultRecipientRepository,
      certificationResultRepository,
    });

    // then
    expect(result).to.deepEqualArray([certificationResult]);
  });

  it('should return an empty array when no candidate matches', async function () {
    // given
    const resultRecipient = new ResultRecipient({
      sessionId: 123,
      resultRecipientEmail: 'nobody@example.net',
      candidateIds: [],
    });
    resultRecipientRepository.get
      .withArgs({ sessionId: 123, resultRecipientEmail: 'nobody@example.net' })
      .resolves(resultRecipient);
    certificationResultRepository.findByCertificationCandidateIds
      .withArgs({ certificationCandidateIds: [] })
      .resolves([]);

    // when
    const result = await getSessionResultsByResultRecipientEmail({
      sessionId: 123,
      resultRecipientEmail: 'nobody@example.net',
      resultRecipientRepository,
      certificationResultRepository,
    });

    // then
    expect(result).to.be.empty;
  });
});
