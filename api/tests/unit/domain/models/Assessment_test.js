const { expect, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | Assessment', function() {

  describe('#isCompleted', function() {

    it('should return true when its state is completed', function() {
      // given
      const assessment = new Assessment({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', function() {
      // given
      const assessment = new Assessment({ state: '' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

  });

  describe('#setCompleted', function() {

    it('should return the same object with state completed', function() {
      // given
      const assessment = new Assessment({ state: 'started', userId: 2 });

      // when
      assessment.setCompleted();

      // then
      expect(assessment.state).to.be.equal('completed');
      expect(assessment.userId).to.be.equal(2);

    });
  });

  describe('#validate', function() {
    let assessment;

    it('should return resolved promise when object is valid', function() {
      // given
      assessment = new Assessment({ type: 'DEMO' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return rejected promise when Certification assessment has no userId', function() {
      //given
      assessment = new Assessment({ type: 'CERTIFICATION' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when Competence evaluation assessment has no userId', function() {
      //given
      assessment = new Assessment({ type: 'COMPETENCE_EVALUATION' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when Campaign assessment has no userId', function() {
      //given
      assessment = new Assessment({ type: 'CAMPAIGN' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });
  });

  describe('#isForCampaign', function() {
    it('should return true when the assessment is for a CAMPAIGN', function() {
      // given
      const assessment = new Assessment({ type: 'CAMPAIGN' });

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.true;
    });

    it('should return false when the assessment is not a CAMPAIGN type', function() {
      // given
      const assessment = new Assessment({ type: 'PLACEMENT' });

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.false;
    });

    it('should return false when the assessment has no type', function() {
      // given
      const assessment = new Assessment({});

      // when
      const isForCampaign = assessment.isForCampaign();

      // then
      expect(isForCampaign).to.be.false;
    });
  });

  describe('#isCertification', function() {
    it('should return true when the assessment is a CERTIFICATION', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'CERTIFICATION' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.true;
    });

    it('should return false when the assessment is not a CERTIFICATION', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'PLACEMENT' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });
  });

  describe('#isPreview', function() {

    it('should return true when the assessment is a preview', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PREVIEW });

      // when/then
      expect(assessment.isPreview()).to.be.true;
    });

    it('should return false when the assessment is not a preview', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isPreview()).to.be.false;
    });
  });

  describe('#isDemo', function() {

    it('should return true when the assessment is a demo', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

      // when/then
      expect(assessment.isDemo()).to.be.true;
    });

    it('should return false when the assessment is not a demo', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isDemo()).to.be.false;
    });
  });

  describe('#isCompetenceEvaluation', function() {

    it('should return true when the assessment is a CompetenceEvaluation', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.true;
    });

    it('should return false when the assessment is not a CompetenceEvaluation', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CAMPAIGN });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });

    it('should return false when the assessment has no type', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });
  });

  describe('#hasKnowledgeElements', function() {

    it('should return true when the assessment is a CompetenceEvaluation', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.true;
    });

    it('should return true when the assessment is a Campaign assessment', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CAMPAIGN });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.true;
    });

    it('should return false when the assessment is not a CompetenceEvaluation nor Campaign', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.false;
    });

    it('should return false when the assessment has no type', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when/then
      expect(assessment.hasKnowledgeElements()).to.be.false;
    });
  });

  describe('#start', function() {

    it('should set the status to "started"', function() {
      // given
      const assessment = domainBuilder.buildAssessment({ status: undefined });

      // when
      assessment.start();

      // then
      expect(assessment.state).to.equal(Assessment.states.STARTED);
    });

  });

  describe('#createForCertificationCourse', function() {

    it('should return a proper assessment for certification course', function() {
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
    });
  });

  describe('#createForCampaign', function() {

    it('should return a proper assessment for campaign', function() {
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

  describe('#createImprovingForCampaign', function() {

    it('should return a proper improving assessment for campaign', function() {
      // given
      const userId = 123;
      const campaignParticipationId = 456;

      // when
      const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });

      // then
      expect(assessment.userId).to.equal(userId);
      expect(assessment.campaignParticipationId).to.equal(campaignParticipationId);
      expect(assessment.state).to.equal(Assessment.states.STARTED);
      expect(assessment.type).to.equal(Assessment.types.CAMPAIGN);
      expect(assessment.courseId).to.equal(Assessment.courseIdMessage.CAMPAIGN);
      expect(assessment.isImproving).to.be.true;
    });
  });

  describe('#createForCompetenceEvaluation', function() {

    it('should return a proper assessment for competence evaluation', function() {
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
    });
  });

  describe('#createImprovingForCompetenceEvaluation', function() {

    it('should return a proper improving assessment for competence evaluation', function() {
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
    });
  });
});
