import { expect } from 'chai';

import * as sessionRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/session-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Integration | Infrastructure | Repositories | Session', function () {
  describe('#getByCertificationCourseId', function () {
    context('when the certification course exists', function () {
      it('should return a session', async function () {
        // given
        const certificationCourseId = 456;
        const sessionId = databaseBuilder.factory.buildSession({ id: 123 }).id;
        databaseBuilder.factory.buildCertificationCourse({
          id: certificationCourseId,
          sessionId,
        });
        await databaseBuilder.commit();

        // when
        const session = await sessionRepository.getByCertificationCourseId({
          certificationCourseId,
        });

        // then
        const expectedSession = domainBuilder.certification.evaluation.buildSession({
          id: session.id,
          isFinalized: session.isFinalized,
          isPublished: session.isPublished,
        });
        expect(session).to.deepEqualInstance(expectedSession);
      });
    });

    context('when the certification does not exist', function () {
      it('should return null', async function () {
        // given, when
        const session = await sessionRepository.getByCertificationCourseId({
          certificationCourseId: 123,
        });

        // then
        expect(session).to.be.null;
      });
    });
  });
});
