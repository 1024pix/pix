import { expect, domainBuilder } from '../../../../test-helper.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

describe('Unit | Domain | Models | Assessment', function () {
  describe('#constuctor', function () {
    it('should init method when none is defined', function () {
      const assessment = new Assessment({
        type: 'COMPETENCE_EVALUATION',
        method: null,
      });

      expect(assessment.method).to.equal('SMART_RANDOM');
    });
  });

  describe('#isCompleted', function () {
    it('should return true when its state is completed', function () {
      // given
      const assessment = new Assessment({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', function () {
      // given
      const assessment = new Assessment({ state: '' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });
  });

  describe('#isEndedBySupervisor', function () {
    it('should return true when its state is endedBySupervisor', function () {
      // given
      const assessment = new Assessment({ state: 'endedBySupervisor' });

      // when
      const isEndedBySupervisor = assessment.isEndedBySupervisor();

      // then
      expect(isEndedBySupervisor).to.be.true;
    });

    it('should return false when its state is not endedBySupervisor', function () {
      // given
      const assessment = new Assessment({ state: '' });

      // when
      const isEndedBySupervisor = assessment.isEndedBySupervisor();

      // then
      expect(isEndedBySupervisor).to.be.false;
    });
  });

  describe('#hasBeenEndedDueToFinalization', function () {
    it('should return true when its state is endedDueToFinalization', function () {
      // given
      const assessment = new Assessment({ state: 'endedDueToFinalization' });

      // when
      const hasBeenEndedDueToFinalization = assessment.hasBeenEndedDueToFinalization();

      // then
      expect(hasBeenEndedDueToFinalization).to.be.true;
    });

    it('should return false when its state is not endedDueToFinalization', function () {
      // given
      const assessment = new Assessment({ state: '' });

      // when
      const hasBeenEndedDueToFinalization = assessment.hasBeenEndedDueToFinalization();

      // then
      expect(hasBeenEndedDueToFinalization).to.be.false;
    });
  });

  describe('#setCompleted', function () {
    it('should return the same object with state completed', function () {
      // given
      const assessment = new Assessment({ state: 'started', userId: 2 });

      // when
      assessment.setCompleted();

      // then
      expect(assessment.state).to.be.equal('completed');
      expect(assessment.userId).to.be.equal(2);
    });
  });

  describe('#validate', function () {
    let assessment;

    it('should return resolved promise when object is valid', function () {
      // given
      assessment = new Assessment({ type: 'DEMO' });

      // when
      const call = () => {
        assessment.validate();
      };

      // then
      expect(call).to.not.throw();
    });

    it('should throw an error when Certification assessment has no userId', function () {
      //given
      assessment = new Assessment({ type: 'CERTIFICATION' });

      // when
      try {
        assessment.validate();
      } catch (e) {
        expect.fail('ObjectValidationError');
      }
    });

    it('should throw an error when Competence evaluation assessment has no userId', function () {
      //given
      assessment = new Assessment({ type: 'COMPETENCE_EVALUATION' });

      // when
      try {
        assessment.validate();
      } catch (e) {
        expect.fail('ObjectValidationError');
      }
    });

    it('should throw an error when Campaign assessment has no userId', function () {
      //given
      assessment = new Assessment({ type: 'CAMPAIGN' });

      // when
      try {
        assessment.validate();
      } catch (e) {
        expect.fail('ObjectValidationError');
      }
    });
  });

  describe('#isForCampaign', function () {
    it('should return true when the assessment is for a CAMPAIGN', function () {
      // given
      const assessment = new Assessment({ type: 'CAMPAIGN' });

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.true;
    });

    it('should return false when the assessment is not a CAMPAIGN type', function () {
      // given
      const assessment = new Assessment({ type: 'PLACEMENT' });

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.false;
    });

    it('should return false when the assessment has no type', function () {
      // given
      const assessment = new Assessment({});

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.false;
    });
  });

  describe('#isCertification', function () {
    it('should return true when the assessment is a CERTIFICATION', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'CERTIFICATION' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.true;
    });

    it('should return false when the assessment is not a CERTIFICATION', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'PLACEMENT' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });
  });

  describe('#isPreview', function () {
    it('should return true when the assessment is a preview', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PREVIEW });

      // when/then
      expect(assessment.isPreview()).to.be.true;
    });

    it('should return false when the assessment is not a preview', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isPreview()).to.be.false;
    });
  });

  describe('#isDemo', function () {
    it('should return true when the assessment is a demo', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

      // when/then
      expect(assessment.isDemo()).to.be.true;
    });

    it('should return false when the assessment is not a demo', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isDemo()).to.be.false;
    });
  });

  describe('#isCompetenceEvaluation', function () {
    it('should return true when the assessment is a CompetenceEvaluation', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.true;
    });

    it('should return false when the assessment is not a CompetenceEvaluation', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CAMPAIGN });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });

    it('should return false when the assessment has no type', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });
  });

  describe('#hasKnowledgeElements', function () {
    it('should return true when the assessment is a CompetenceEvaluation', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.true;
    });

    it('should return true when the assessment is a Campaign assessment with Smart Random Method', function () {
      // given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        method: Assessment.methods.SMART_RANDOM,
      });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.true;
    });

    it('should return false when the assessment is a Campaign assessment with Flash Method', function () {
      // given
      const assessment = domainBuilder.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        method: Assessment.methods.FLASH,
      });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.false;
    });

    it('should return false when the assessment is not a CompetenceEvaluation nor Campaign', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.false;
    });

    it('should return false when the assessment has no type', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.false;
    });
  });

  describe('#start', function () {
    it('should set the status to "started"', function () {
      // given
      const assessment = domainBuilder.buildAssessment({ status: undefined });

      // when
      assessment.start();

      // then
      expect(assessment.state).to.equal(Assessment.states.STARTED);
    });
  });

  describe('#createForCertificationCourse', function () {
    it('should return a proper assessment for certification course', function () {
      // given
      const userId = 123;
      const certificationCourseId = 456;

      // when
      const assessment = Assessment.createForCertificationCourse({ userId, certificationCourseId });

      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.certificationCourseId).to.equal(certificationCourseId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.CERTIFICATION);
      expect(assessment.isImproving).to.be.false;
      expect(assessment.method).to.equal('CERTIFICATION_DETERMINED');
    });
  });

  describe('#createForCampaign', function () {
    it('should return a proper assessment for campaign', function () {
      // given
      const userId = 123;
      const campaignParticipationId = 456;

      // when
      const assessment = Assessment.createForCampaign({ userId, campaignParticipationId });

      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.campaignParticipationId).to.equal(campaignParticipationId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.CAMPAIGN);
      expect(assessment.courseId).to.equal(Assessment.courseIdMessage.CAMPAIGN);
      expect(assessment.isImproving).to.be.false;
    });
  });

  describe('#createImprovingForCampaign', function () {
    it('should return a proper improving assessment for campaign', function () {
      // given
      const userId = 123;
      const campaignParticipationId = 456;
      const method = 'FLASH';

      // when
      const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId, method });

      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.campaignParticipationId).to.equal(campaignParticipationId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.CAMPAIGN);
      expect(assessment.courseId).to.equal(Assessment.courseIdMessage.CAMPAIGN);
      expect(assessment.isImproving).to.be.true;
      expect(assessment.isFlash()).to.be.true;
    });
  });

  describe('#createForCompetenceEvaluation', function () {
    it('should return a proper assessment for competence evaluation', function () {
      // given
      const userId = 123;
      const competenceId = 'rec123ABC';

      // when
      const assessment = Assessment.createForCompetenceEvaluation({ userId, competenceId });

      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.competenceId).to.equal(competenceId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.COMPETENCE_EVALUATION);
      expect(assessment.courseId).to.equal(Assessment.courseIdMessage.COMPETENCE_EVALUATION);
      expect(assessment.isImproving).to.be.false;
      expect(assessment.method).to.equal('SMART_RANDOM');
    });
  });

  describe('#createImprovingForCompetenceEvaluation', function () {
    it('should return a proper improving assessment for competence evaluation', function () {
      // given
      const userId = 123;
      const competenceId = 'rec123ABC';
      // when
      const assessment = Assessment.createImprovingForCompetenceEvaluation({ userId, competenceId });
      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.competenceId).to.equal(competenceId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.COMPETENCE_EVALUATION);
      expect(assessment.courseId).to.equal(Assessment.courseIdMessage.COMPETENCE_EVALUATION);
      expect(assessment.isImproving).to.be.true;
      expect(assessment.method).to.equal('SMART_RANDOM');
    });
  });

  describe('#createForPix1dMission', function () {
    it('should return a proper mission assessment for pix1d', function () {
      // when
      const assessment = Assessment.createForPix1dMission();

      // then
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.PIX1D_MISSION);
      expect(assessment.method).to.equal(Assessment.methods.PIX1D);
    });
  });

  describe('#computeMethod', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { assessmentType: 'PREVIEW', expectedMethod: 'CHOSEN' },
      { assessmentType: 'CERTIFICATION', expectedMethod: 'CERTIFICATION_DETERMINED' },
      { assessmentType: 'DEMO', expectedMethod: 'COURSE_DETERMINED' },
      { assessmentType: 'COMPETENCE_EVALUATION', expectedMethod: 'SMART_RANDOM' },
      { assessmentType: 'CAMPAIGN', expectedMethod: 'SMART_RANDOM' },
    ].forEach(function ({ assessmentType, expectedMethod }) {
      it(`should return "${expectedMethod}" if assessment type is "${assessmentType}"`, function () {
        // when
        const method = Assessment.computeMethodFromType(assessmentType);

        // then
        expect(method).to.equal(expectedMethod);
      });
    });
  });

  describe('#hasOngoingLiveAlert', function () {
    describe('when assessment has no live alerts attached', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment();

        expect(assessmentWithoutLiveAlert.hasOngoingLiveAlert).to.be.false;
      });
    });

    describe('when assessment has live alerts attached but no ongoing', function () {
      it('should return false', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment({
          liveAlerts: [
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.DISMISSED,
            }),
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.VALIDATED,
            }),
          ],
        });

        expect(assessmentWithoutLiveAlert.hasOngoingLiveAlert).to.be.false;
      });
    });

    describe('when assessment has an ongoing live alert ', function () {
      it('should return true', function () {
        const assessmentWithoutLiveAlert = domainBuilder.buildAssessment({
          liveAlerts: [
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.DISMISSED,
            }),
            domainBuilder.buildCertificationChallengeLiveAlert({
              status: CertificationChallengeLiveAlertStatus.ONGOING,
            }),
          ],
        });

        expect(assessmentWithoutLiveAlert.hasOngoingLiveAlert).to.be.true;
      });
    });
  });
});
