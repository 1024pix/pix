import * as sessionRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/session-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Evaluation | Integration | Infrastructure | Repositories | Session', function () {
  describe('#get', function () {
    context('when the session exists', function () {
      it('should return a session', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({ id: 123, date: '2023-06-06' }).id;
        await databaseBuilder.commit();

        // when
        const session = await sessionRepository.get({ id: sessionId });

        // then
        const expectedSession = domainBuilder.certification.evaluation.buildSession({
          id: session.id,
          date: '2023-06-06',
          isFinalized: session.isFinalized,
          isPublished: session.isPublished,
        });
        expect(session).to.deepEqualInstance(expectedSession);
      });
    });

    context('when the session does not exist', function () {
      it('should throw a not found error', async function () {
        // given, when
        const error = await catchErr(sessionRepository.get)({ id: 999 });

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
      });
    });
  });

  describe('#getByCertificationCourseId', function () {
    context('when the certification course exists', function () {
      it('should return a session', async function () {
        // given
        const certificationCourseId = 456;
        const sessionId = databaseBuilder.factory.buildSession({ id: 123, date: '2023-06-06' }).id;
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
          date: '2023-06-06',
          isFinalized: session.isFinalized,
          isPublished: session.isPublished,
        });
        expect(session).to.deepEqualInstance(expectedSession);
      });
    });

    context('when the certification does not exist', function () {
      it('should throw a not found error', async function () {
        // given, when
        const error = await catchErr(sessionRepository.getByCertificationCourseId)({
          certificationCourseId: 123,
        });

        // then
        expect(error).to.be.an.instanceof(NotFoundError);
      });
    });
  });

  describe('#update', function () {
    it('should only update allowed fields', async function () {
      // given
      databaseBuilder.factory.buildSession({
        id: 123,
        date: '2023-06-06',
        accessCode: 'ABCDEF',
        finalizedAt: new Date(),
        publishedAt: new Date(),
      }).id;
      await databaseBuilder.commit();
      const sessionToUpdate = domainBuilder.certification.evaluation.buildSession({
        id: 123,
        accessCode: 'FMKP39',
        date: '2025-05-05',
        isFinalized: false,
        isPublished: false,
      });

      // when
      await sessionRepository.update(sessionToUpdate);

      // then
      const updatedSession = await sessionRepository.get({ id: 123 });
      expect(updatedSession).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildSession({
          id: 123,
          date: '2025-05-05',
          accessCode: 'ABCDEF',
          isFinalized: true,
          isPublished: true,
        }),
      );
    });
  });
});
