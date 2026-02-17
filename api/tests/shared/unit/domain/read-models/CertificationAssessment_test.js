import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CertificationAssessment } from '../../../../../src/shared/domain/read-models/CertificationAssessment.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CertificationAssessment', function () {
  describe('#constructor', function () {
    let assessment;
    before(function () {
      assessment = new CertificationAssessment({ certificationCourseId: 'certificationCourseId' });
    });

    it('should be of type CERTIFICATION', function () {
      expect(assessment.type).to.equal(Assessment.types.CERTIFICATION);
    });

    it('should have method of type CERTIFICATION_DETERMINED', function () {
      expect(assessment.method).to.equal(Assessment.methods.CERTIFICATION_DETERMINED);
    });

    it('should init showChallengeStepper', function () {
      expect(assessment.showChallengeStepper).to.equal(false);
    });

    it('should init showGlobalProgression', function () {
        expect(assessment.showGlobalProgression).to.equal(false);
    });

    it('should init hasCheckpoints', function () {
      expect(assessment.hasCheckpoints).to.equal(false);
    });

    it('should init showLevelup', function () {
      expect(assessment.showLevelup).to.equal(false);
    });

    it('should init showQuestionCounter', function () {
      expect(assessment.showQuestionCounter).to.equal(true);
    });

    it('should init title', function () {
      expect(assessment.title).to.equal('certificationCourseId');
    });
  });

  describe('#hasOngoingChallengeLiveAlert', function () {
    describe('when assessment has no live alerts attached', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment();
        const certificationAssessment = new CertificationAssessment(assessmentWithoutLiveAlert);

        expect(certificationAssessment.hasOngoingChallengeLiveAlert).to.be.false;
      });
    });

    describe('when assessment has live alerts attached but no ongoing', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment({
          challengeLiveAlerts: [
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.DISMISSED,
            }),
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.VALIDATED,
            }),
          ],
        });
        const certificationAssessment = new CertificationAssessment(assessmentWithoutLiveAlert);

        expect(certificationAssessment.hasOngoingChallengeLiveAlert).to.be.false;
      });
    });

    describe('when assessment has an ongoing live alert ', function () {
      it('should return true', function () {
        const assessmentWithLiveAlert = domainBuilder.buildAssessment({
          challengeLiveAlerts: [
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.DISMISSED,
            }),
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.ONGOING,
            }),
          ],
        });
        const certificationAssessment = new CertificationAssessment(assessmentWithLiveAlert);

        expect(certificationAssessment.hasOngoingChallengeLiveAlert).to.be.true;
      });
    });
  });

  describe('#hasOngoingCompanionLiveAlert', function () {
    describe('when assessment has no live alerts attached', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment();
        const certificationAssessment = new CertificationAssessment(assessmentWithoutLiveAlert);

        expect(certificationAssessment.hasOngoingCompanionLiveAlert).to.be.false;
      });
    });

    describe('when assessment has live alerts attached but no ongoing', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment({
          companionLiveAlerts: [
            domainBuilder.buildCertificationCompanionLiveAlert({
              status: CertificationCompanionLiveAlertStatus.CLEARED,
            }),
            domainBuilder.buildCertificationCompanionLiveAlert({
              status: CertificationCompanionLiveAlertStatus.CLEARED,
            }),
          ],
        });
        const certificationAssessment = new CertificationAssessment(assessmentWithoutLiveAlert);

        expect(certificationAssessment.hasOngoingCompanionLiveAlert).to.be.false;
      });
    });

    describe('when assessment has an ongoing live alert ', function () {
      it('should return true', function () {
        const assessmentWithLiveAlert = domainBuilder.buildAssessment({
          companionLiveAlerts: [
            domainBuilder.buildCertificationCompanionLiveAlert({
              status: CertificationCompanionLiveAlertStatus.CLEARED,
            }),
            domainBuilder.buildCertificationCompanionLiveAlert({
              status: CertificationCompanionLiveAlertStatus.ONGOING,
            }),
          ],
        });
        const certificationAssessment = new CertificationAssessment(assessmentWithLiveAlert);

        expect(certificationAssessment.hasOngoingCompanionLiveAlert).to.be.true;
      });
    });
  });
});
