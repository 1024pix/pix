import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import * as certificationCompanionAlertRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-companion-alert-repository.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

const { clearCompanionAlert } = usecases;

describe('Certification | Session Management | Integration | Domain | UseCase | clear-companion-alert', function () {
  it('should change ONGOING alert status to CLEARED', async function () {
    // given
    const { id: sessionId } = databaseBuilder.factory.buildSession();

    const { id: certificationCourseId, userId } = databaseBuilder.factory.buildCertificationCourse({ sessionId });
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId,
      status: CertificationCompanionLiveAlertStatus.CLEARED,
    });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId,
      status: CertificationCompanionLiveAlertStatus.ONGOING,
    });

    const { id: otherCertificationCourseId, userId: otherUserId } = databaseBuilder.factory.buildCertificationCourse({
      sessionId,
    });
    const { id: otherAssessmentId } = databaseBuilder.factory.buildAssessment({
      userId: otherUserId,
      certificationCourseId: otherCertificationCourseId,
    });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId: otherAssessmentId,
      status: CertificationCompanionLiveAlertStatus.CLEARED,
    });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId: otherAssessmentId,
      status: CertificationCompanionLiveAlertStatus.ONGOING,
    });

    const { id: otherSessionId } = databaseBuilder.factory.buildSession();
    const { id: oldCertificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
      sessionId: otherSessionId,
      userId,
    });
    const { id: oldAssessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      certificationCourseId: oldCertificationCourseId,
    });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId: oldAssessmentId,
      status: CertificationCompanionLiveAlertStatus.CLEARED,
    });
    databaseBuilder.factory.buildCertificationCompanionLiveAlert({
      assessmentId: oldAssessmentId,
      status: CertificationCompanionLiveAlertStatus.CLEARED,
    });

    await databaseBuilder.commit();

    // when
    await clearCompanionAlert({
      sessionId,
      userId,
      certificationCompanionAlertRepository,
    });

    // then
    const alerts = await knex
      .select('status', 'assessmentId', 'updatedAt')
      .from('certification-companion-live-alerts')
      .orderBy('id');

    const updatedAlert = alerts[1];

    const otherAlerts = [alerts[0], ...alerts.slice(2)];

    expect(updatedAlert).to.contain({
      status: CertificationCompanionLiveAlertStatus.CLEARED,
      assessmentId,
    });
    expect(updatedAlert.updatedAt).to.be.greaterThan(new Date('2020-02-01'));

    expect(otherAlerts).to.deep.equal([
      { status: CertificationCompanionLiveAlertStatus.CLEARED, assessmentId, updatedAt: new Date('2020-02-01') },
      {
        status: CertificationCompanionLiveAlertStatus.CLEARED,
        assessmentId: otherAssessmentId,
        updatedAt: new Date('2020-02-01'),
      },
      {
        status: CertificationCompanionLiveAlertStatus.ONGOING,
        assessmentId: otherAssessmentId,
        updatedAt: new Date('2020-02-01'),
      },
      {
        status: CertificationCompanionLiveAlertStatus.CLEARED,
        assessmentId: oldAssessmentId,
        updatedAt: new Date('2020-02-01'),
      },
      {
        status: CertificationCompanionLiveAlertStatus.CLEARED,
        assessmentId: oldAssessmentId,
        updatedAt: new Date('2020-02-01'),
      },
    ]);
  });

  describe('when no ONGOING alert for user', function () {
    it('should do nothing', async function () {
      // given
      const { id: certificationCourseId, sessionId, userId } = databaseBuilder.factory.buildCertificationCourse();
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId });
      const firstAlert = databaseBuilder.factory.buildCertificationCompanionLiveAlert({
        assessmentId,
        status: CertificationCompanionLiveAlertStatus.CLEARED,
      });
      const secondAlert = databaseBuilder.factory.buildCertificationCompanionLiveAlert({
        assessmentId,
        status: CertificationCompanionLiveAlertStatus.CLEARED,
      });
      await databaseBuilder.commit();

      // when
      await clearCompanionAlert({
        sessionId,
        userId,
        certificationCompanionAlertRepository,
      });

      // then
      const alerts = await knex
        .select('status', 'assessmentId', 'updatedAt')
        .from('certification-companion-live-alerts')
        .orderBy('id');
      expect(alerts).to.deep.equal([
        { status: CertificationCompanionLiveAlertStatus.CLEARED, assessmentId, updatedAt: firstAlert.updatedAt },
        { status: CertificationCompanionLiveAlertStatus.CLEARED, assessmentId, updatedAt: secondAlert.updatedAt },
      ]);
    });
  });
});
