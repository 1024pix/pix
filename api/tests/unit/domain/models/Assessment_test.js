const { expect, domainBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Unit | Domain | Models | Assessment', () => {

  describe('#isCompleted', () => {

    it('should return true when its state is completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: '' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.false;
    });

  });

  describe('#getLastAssessmentResult', () => {

    it('should return the last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: new Date('2017-12-20T02:03:04Z'),
        emitter: 'PIX-ALGO',
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: new Date('2017-12-24T01:02:03Z'),
        emitter: 'Michel',
      });

      const assessmentResultJuryOld = new AssessmentResult({
        id: 3,
        createdAt: new Date('2017-12-22T01:02:03Z'),
        emitter: 'Gerard',
      });

      const assessment = Assessment.fromAttributes({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury, assessmentResultJuryOld],
      });

      // when
      const lastResult = assessment.getLastAssessmentResult();

      // then
      expect(lastResult.id).to.be.equal(2);
      expect(lastResult.emitter).to.be.equal('Michel');
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = Assessment.fromAttributes({ status: '' });

      // when
      const lastResult = assessment.getLastAssessmentResult();

      // then
      expect(lastResult).to.be.null;
    });

  });

  describe('#getPixScore', () => {

    it('should return the pixScore of last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: new Date('2017-12-20T01:02:03Z'),
        pixScore: 12,
        emitter: 'PIX-ALGO',
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: new Date('2017-12-24T01:02:03Z'),
        pixScore: 18,
        emitter: 'Michel',
      });

      const assessment = Assessment.fromAttributes({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury],
      });

      // when
      const pixScore = assessment.getPixScore();

      // then
      expect(pixScore).to.be.equal(18);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = Assessment.fromAttributes({ status: '' });

      // when
      const pixScore = assessment.getPixScore();

      // then
      expect(pixScore).to.be.null;
    });

  });

  describe('#getLevel', () => {

    it('should return the pixScore of last assessment results', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 1,
        createdAt: new Date('2017-12-20T01:02:03Z'),
        level: 1,
        emitter: 'PIX-ALGO',
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: new Date('2017-12-24T01:02:03Z'),
        level: 5,
        emitter: 'Michel',
      });

      const assessment = Assessment.fromAttributes({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury],
      });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.equal(5);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = Assessment.fromAttributes({ status: '' });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.null;
    });

  });

  describe('#setCompleted', () => {

    it('should return the same object with state completed', () => {
      // given
      const assessment = Assessment.fromAttributes({ state: 'started', userId: 2 });

      // when
      assessment.setCompleted();

      // then
      expect(assessment.state).to.be.equal('completed');
      expect(assessment.userId).to.be.equal(2);

    });
  });

  describe('#validate', () => {
    let assessment;

    it('should return resolved promise when object is valid', () => {
      // given
      assessment = Assessment.fromAttributes({ type: 'DEMO' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return rejected promise when Certification assessment has no userId', () => {
      //given
      assessment = Assessment.fromAttributes({ type: 'CERTIFICATION' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when Competence evaluation assessment has no userId', () => {
      //given
      assessment = Assessment.fromAttributes({ type: 'COMPETENCE_EVALUATION' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when Smart Placement assessment has no userId', () => {
      //given
      assessment = Assessment.fromAttributes({ type: 'SMART_PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });
  });

  describe('#isSmartPlacement', () => {
    it('should return true when the assessment is a SMART_PLACEMENT', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'SMART_PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacement();

      // then
      expect(isSmartPlacementAssessment).to.be.true;
    });

    it('should return false when the assessment is not a SMART_PLACEMENT', () => {
      // given
      const assessment = Assessment.fromAttributes({ type: 'PLACEMENT' });

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacement();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = Assessment.fromAttributes({});

      // when
      const isSmartPlacementAssessment = assessment.isSmartPlacement();

      // then
      expect(isSmartPlacementAssessment).to.be.false;
    });
  });

  describe('#isCertification', () => {
    it('should return true when the assessment is a CERTIFICATION', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'CERTIFICATION' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.true;
    });

    it('should return false when the assessment is not a CERTIFICATION', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'PLACEMENT' });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when
      const isCertificationAssessment = assessment.isCertification();

      // then
      expect(isCertificationAssessment).to.be.false;
    });
  });

  describe('#isPreview', () => {

    it('should return true when the assessment is a preview', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PREVIEW });

      // when/then
      expect(assessment.isPreview()).to.be.true;
    });

    it('should return false when the assessment is not a preview', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isPreview()).to.be.false;
    });
  });

  describe('#isDemo', () => {

    it('should return true when the assessment is a demo', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

      // when/then
      expect(assessment.isDemo()).to.be.true;
    });

    it('should return false when the assessment is not a demo', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: 'otherType' });

      // when/then
      expect(assessment.isDemo()).to.be.false;
    });
  });

  describe('#isCompetenceEvaluation', () => {

    it('should return true when the assessment is a CompetenceEvaluation', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.true;
    });

    it('should return false when the assessment is not a CompetenceEvaluation', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.SMARTPLACEMENT });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });

    it('should return false when the assessment has no type', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ type: null });

      // when/then
      expect(assessment.isCompetenceEvaluation()).to.be.false;
    });
  });

  describe('#isCertifiable', () => {

    it('should return true when the last assessment has a level > 0', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 3,
        createdAt: new Date('2017-12-22T01:02:03Z'),
        emitter: 'Gerard',
        level: 3,
      });

      const assessment = Assessment.fromAttributes({
        assessmentResults: [assessmentResultComputed]
      });

      // when
      const isCompleted = assessment.isCertifiable();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when the last assessment has a level < 1', () => {
      // given
      const assessmentResultComputed = new AssessmentResult({
        id: 3,
        createdAt: new Date('2017-12-22T01:02:03Z'),
        emitter: 'Gerard',
        level: 0,
      });

      const assessment = Assessment.fromAttributes({
        assessmentResults: [assessmentResultComputed]
      });

      // when
      const isCompleted = assessment.isCertifiable();

      // then
      expect(isCompleted).to.be.false;
    });
  });

  describe('#start', () => {

    it('should set the status to "started"', () => {
      // given
      const assessment = domainBuilder.buildAssessment({ status: undefined });

      // when
      assessment.start();

      // then
      expect(assessment.state).to.equal(Assessment.states.STARTED);
    });

  });
});
