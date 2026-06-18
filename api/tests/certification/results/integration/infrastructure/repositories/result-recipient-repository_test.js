import { ResultRecipient } from '../../../../../../src/certification/results/domain/read-models/ResultRecipient.js';
import * as resultRecipientRepository from '../../../../../../src/certification/results/infrastructure/repositories/result-recipient-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Infrastructure | Repository | ResultRecipient', function () {
  describe('#get', function () {
    it('should return candidate ids matching sessionId and resultRecipientEmail (case insensitive)', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const candidate1 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        resultRecipientEmail: 'recipient@example.net',
      });
      const candidate2 = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        resultRecipientEmail: 'RECIPIENT@example.net',
      });
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        resultRecipientEmail: 'other@example.net',
      });
      await databaseBuilder.commit();

      // when
      const result = await resultRecipientRepository.get({
        sessionId,
        resultRecipientEmail: 'recipient@example.net',
      });

      // then
      expect(result).to.be.instanceOf(ResultRecipient);
      expect(result.sessionId).to.equal(sessionId);
      expect(result.resultRecipientEmail).to.equal('recipient@example.net');
      expect(result.candidateIds).to.have.members([candidate1.id, candidate2.id]);
    });

    it('should return an empty candidateIds array when no candidate matches', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      await databaseBuilder.commit();

      // when
      const result = await resultRecipientRepository.get({
        sessionId,
        resultRecipientEmail: 'nobody@example.net',
      });

      // then
      expect(result.candidateIds).to.be.empty;
    });
  });
});
