import sinon from 'sinon';

import { getSessionResults } from '../../../../../../src/certification/results/domain/usecases/get-session-results.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Use Cases | get-session-results', function () {
  const certificationResultRepository = { findBySessionId: null };

  beforeEach(function () {
    certificationResultRepository.findBySessionId = sinon.stub();
  });

  it('should return the certificationResults', async function () {
    // given
    const certificationResult1 = domainBuilder.buildCertificationResult({ firstName: 'Buffy' });
    const certificationResult2 = domainBuilder.buildCertificationResult({ firstName: 'Spike' });
    certificationResultRepository.findBySessionId
      .withArgs({ sessionId: 123 })
      .resolves([certificationResult1, certificationResult2]);

    // when
    const certificationResults = await getSessionResults({
      sessionId: 123,
      certificationResultRepository,
    });

    // then
    expect(certificationResults).to.deepEqualArray([certificationResult1, certificationResult2]);
  });
});
