import { SessionWithAbortReasonOnCompletedCertificationCourseError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/constants/abort-reasons.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Session Management | Integration | Domain | UseCase | Finalize Session ', function () {
  context('When there is an abort reason for completed certification course', function () {
    it('should throw an SessionWithAbortReasonOnCompletedCertificationCourseError error', async function () {
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        abortReason: ABORT_REASONS.CANDIDATE,
        completedAt: new Date(),
      });
      await databaseBuilder.commit();
      const certificationReports = [
        { certificationCourseId: certificationCourse.id, abortReason: ABORT_REASONS.CANDIDATE },
      ];

      const err = await catchErr(usecases.finalizeSession)({
        sessionId: certificationCourse.sessionId,
        certificationReports,
      });

      expect(err).to.be.instanceOf(SessionWithAbortReasonOnCompletedCertificationCourseError);
      const updatedCertificationCourse = await knex('certification-courses')
        .where('id', certificationCourse.id)
        .first();
      expect(updatedCertificationCourse.abortReason).to.be.null;
    });
  });

  context('when an error occurs', function () {
    it('should rollback session finalization', async function () {
      // given
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        abortReason: null,
        updatedAt: new Date(),
        completedAt: null,
      });
      await databaseBuilder.commit();
      const certificationReports = [
        domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          certificationCourseId: certificationCourse.id,
          isCompleted: true,
        }),
      ];

      // when
      const errorDuringTransaction = await catchErr(async ({ sessionId, certificationReports }) => {
        await DomainTransaction.execute(async () => {
          await usecases.finalizeSession({
            sessionId,
            certificationReports,
          });
          throw new Error('test error');
        });
      })({
        sessionId: certificationCourse.sessionId,
        certificationReports,
      });

      // then
      expect(errorDuringTransaction.message).to.equal('test error');

      const notFinalizedSession = await knex('sessions').where('id', certificationCourse.sessionId).first();
      expect(notFinalizedSession.finalizedAt).to.be.null;

      const updatedCertificationCourse = await knex('certification-courses')
        .where('id', certificationCourse.id)
        .first();
      expect(updatedCertificationCourse.abortReason).to.be.null;
      expect(updatedCertificationCourse.updatedAt).to.deep.equal(certificationCourse.updatedAt);
    });
  });
});
