import { SessionForResultsCsv } from '../../../../../../src/certification/results/domain/read-models/SessionForResultsCsv.js';
import * as sessionForResultsCsvRepository from '../../../../../../src/certification/results/infrastructure/repositories/session-for-results-csv-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Infrastructure | Repository | SessionForResultsCsv', function () {
  describe('#get', function () {
    it('should return a SessionForResultsCsv with the session data', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre de test' }).id;
      const sessionId = databaseBuilder.factory.buildSession({
        date: '2024-06-15',
        time: '14:30:00',
        certificationCenter: 'Centre de test',
        certificationCenterId,
      }).id;
      await databaseBuilder.commit();

      // when
      const result = await sessionForResultsCsvRepository.get(sessionId);

      // then
      expect(result).to.be.instanceOf(SessionForResultsCsv);
      expect(result.id).to.equal(sessionId);
      expect(result.date).to.equal('2024-06-15');
      expect(result.time).to.equal('14:30:00');
      expect(result.certificationCenter).to.equal('Centre de test');
    });
  });
});
