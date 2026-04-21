import * as certificationCompanionAlertRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-companion-alert-repository.js';
import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Session-management | Integration | Infrastructure | Repositories | Certification Companion Alert', function () {
  describe('#getOngoingAlert', function () {
    it('should get correct ongoing companion alert', async function () {
      // given
      const sessionId = 200;
      databaseBuilder.factory.buildSession({ id: sessionId });

      const { userId, assessmentId, expectedCompanionLiveAlertId } = _buildCandidateWithCompanionAlerts({ sessionId });
      _buildCandidateWithCompanionAlerts({ sessionId });

      await databaseBuilder.commit();

      // when
      const ongoingAlert = await certificationCompanionAlertRepository.getOngoingAlert({ sessionId, userId });

      // then
      expect(ongoingAlert).to.deep.equal(
        new CertificationCompanionLiveAlert({
          id: expectedCompanionLiveAlertId,
          assessmentId,
          status: CertificationCompanionLiveAlertStatus.ONGOING,
        }),
      );
    });
  });
});

function _buildCandidateWithCompanionAlerts({ sessionId }) {
  const user = databaseBuilder.factory.buildUser();
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId: user.id,
    sessionId,
  });
  const assessment = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    userId: user.id,
  });

  databaseBuilder.factory.buildCertificationCompanionLiveAlert({
    assessmentId: assessment.id,
    status: CertificationCompanionLiveAlertStatus.CLEARED,
  });

  const companionLiveAlert = databaseBuilder.factory.buildCertificationCompanionLiveAlert({
    assessmentId: assessment.id,
    status: CertificationCompanionLiveAlertStatus.ONGOING,
  });

  return { userId: user.id, assessmentId: assessment.id, expectedCompanionLiveAlertId: companionLiveAlert.id };
}
