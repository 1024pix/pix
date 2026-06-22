import * as sessionForResultsSharingRepository from '../../../../../../src/certification/results/infrastructure/repositories/session-for-results-sharing-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Integration | Infrastructure | Repository | sessionForResultsSharing', function () {
  describe('#get', function () {
    it('should return a sessionForResultsSharing with the session data', async function () {
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
      const result = await sessionForResultsSharingRepository.get(sessionId);

      // then
      expect(result).to.deepEqualInstance(
        domainBuilder.certification.results.buildSessionForResultsSharing({
          id: sessionId,
          date: '2024-06-15',
          time: '14:30:00',
          certificationCenter: 'Centre de test',
        }),
      );
    });
  });
});
