import { expect } from 'chai';

import * as sessionRepository from '../../../../../../src/certification/results/infrastructure/repositories/session-repository.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Integration | Infrastructure | Repository | Session', function () {
  describe('#get', function () {
    it('returns null when no certification exists for the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildCertificationCourse({ id: 3, sessionId });
      databaseBuilder.factory.buildCertificationCourse({ id: 1, sessionId });
      databaseBuilder.factory.buildCertificationCourse({ id: 2, sessionId });
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      await databaseBuilder.commit();

      // when
      const session = await sessionRepository.get(anotherSessionId);

      // then
      expect(session).to.be.null;
    });

    it('returns the Session model some certifications exist for the session', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildCertificationCourse({ id: 3, sessionId });
      databaseBuilder.factory.buildCertificationCourse({ id: 1, sessionId });
      databaseBuilder.factory.buildCertificationCourse({ id: 2, sessionId });
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      databaseBuilder.factory.buildCertificationCourse({ id: 4, sessionId: anotherSessionId });
      await databaseBuilder.commit();

      // when
      const session = await sessionRepository.get(sessionId);

      // then
      expect(session).to.deepEqualInstance(
        domainBuilder.certification.results.buildSession({ id: sessionId, certificationIds: [1, 2, 3] }),
      );
    });
  });
});
