const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Assessment', () => {

  describe('#isCompleted', () => {

    it('should return true when its state is completed', () => {
      // given
      const assessment = new Assessment({ state: 'completed' });

      // when
      const isCompleted = assessment.isCompleted();

      // then
      expect(isCompleted).to.be.true;
    });

    it('should return false when its state is not completed', () => {
      // given
      const assessment = new Assessment({ state: '' });

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
        createdAt: '2017-12-20',
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        emitter: 'Michel'
      });

      const assessmentResultJuryOld = new AssessmentResult({
        id: 3,
        createdAt: '2017-12-22',
        emitter: 'Gerard'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury, assessmentResultJuryOld]
      });

      // when
      const lastResult = assessment.getLastAssessmentResult();

      // then
      expect(lastResult.id).to.be.equal(2);
      expect(lastResult.emitter).to.be.equal('Michel');
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

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
        createdAt: '2017-12-20',
        pixScore: 12,
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        pixScore: 18,
        emitter: 'Michel'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury]
      });

      // when
      const pixScore = assessment.getPixScore();

      // then
      expect(pixScore).to.be.equal(18);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

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
        createdAt: '2017-12-20',
        level: 1,
        emitter: 'PIX-ALGO'
      });
      const assessmentResultJury = new AssessmentResult({
        id: 2,
        createdAt: '2017-12-24',
        level: 5,
        emitter: 'Michel'
      });

      const assessment = new Assessment({
        status: 'completed',
        assessmentResults: [assessmentResultComputed, assessmentResultJury]
      });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.equal(5);
    });

    it('should return null when assessment has no result', () => {
      // given
      const assessment = new Assessment({ status: '' });

      // when
      const level = assessment.getLevel();

      // then
      expect(level).to.be.null;
    });

  });

  describe('#setCompleted', () => {

    it('should return the same object with state completed', () => {
      // given
      const assessment = new Assessment({ state: 'started', userId: 2 });

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
      assessment = new Assessment({ id: 1, courseId: 'rec123', userId: 3, type: 'DEMO' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return resolved promise when Placement assessment is valid', () => {
      //given
      assessment = new Assessment({ id: 1, courseId: 'rec123', userId: 3, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should return rejected promise when Placement assessment has no userId', () => {
      //given
      assessment = new Assessment({ id: 1, courseId: 'rec123', type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

    it('should return rejected promise when userId is null for placement', () => {
      //given
      assessment = new Assessment({ id: 1, courseId: 'rec123', userId: null, type: 'PLACEMENT' });

      // when
      const promise = assessment.validate();

      // then
      return expect(promise).to.be.rejected;
    });

  });
});
