import { expect } from 'chai';

import * as sessionForResultsSharingRepository from '../../../../../../src/certification/results/infrastructure/repositories/session-for-results-sharing-repository.js';
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
        version: 3,
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
          version: 3,
        }),
      );
    });

    it('should return null when session does not exist', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      await databaseBuilder.commit();

      // when
      const result = await sessionForResultsSharingRepository.get(sessionId + 1);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#findPublishedSessionIds', function () {
    it('should return the ids of the given sessions that are published', async function () {
      // given
      const publishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date() }).id;
      const unpublishedSessionId = databaseBuilder.factory.buildSession({ publishedAt: null }).id;
      databaseBuilder.factory.buildSession({ publishedAt: new Date() });
      await databaseBuilder.commit();

      // when
      const sessionIds = await sessionForResultsSharingRepository.findPublishedSessionIds({
        sessionIds: [publishedSessionId, unpublishedSessionId],
      });

      // then
      expect(sessionIds).to.deep.equal([publishedSessionId]);
    });
  });
});
