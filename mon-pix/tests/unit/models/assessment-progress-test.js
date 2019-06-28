import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import AssessmentProgression from 'mon-pix/models/assessment-progression';

describe('Unit | Model | assessment progress', function() {

  describe('@_currentStep', function() {

    context('when assessment type is not "SMART_PLACEMENT"', function() {

      it('should return the number of current challenges', () => {
        // given
        const model = AssessmentProgression.create({
          assessmentType: 'DEMO',
          challengesAnsweredCount: 8,
          challengesToAnswerCount: 10,
        });

        // when
        const _currentStep = model.get('_currentStep');

        // then
        expect(_currentStep).to.equal(9);
      });

      it('should return the number of current challenges and not exceed the number of challenge', () => {
        // given
        const model = AssessmentProgression.create({
          assessmentType: 'DEMO',
          challengesAnsweredCount: 10,
          challengesToAnswerCount: 10,
        });
        // when
        const _currentStep = model.get('_currentStep');
        // then
        expect(_currentStep).to.equal(10);
      });
      
    });

    context('when assessment type is "SMART_PLACEMENT"', function() {

      let model;

      beforeEach(function() {
        // given
        model = AssessmentProgression.create({
          assessmentType: 'SMART_PLACEMENT',
        });
      });

      it('should return 3 if number of answers is 2 (less than 5)', () => {
        // given
        model.set('challengesAnsweredCount', 2);

        // when
        const _currentStep = model.get('_currentStep');

        // then
        expect(_currentStep).to.equal(3);
      });

      it('should return 4 (a modulo of 5) if number of answers is 8 (more than 5)', () => {
        // given
        model.set('challengesAnsweredCount', 8);

        // when
        const _currentStep = model.get('_currentStep');

        // then
        expect(_currentStep).to.equal(4);
      });
    });
  });

  describe('@_maxSteps', function() {

    context('when assessment type is not "SMART_PLACEMENT"', function() {

      it('should return the number of answers linked to an assessment', () => {
        // given
        const model = AssessmentProgression.create({
          assessmentType: 'DEMO',
          challengesToAnswerCount: 10
        });

        // when
        const _maxSteps = model.get('_maxSteps');

        // then
        expect(_maxSteps).to.equal(10);
      });
    });

    context('when assessment type is "SMART_PLACEMENT"', function() {

      it('should return 5', () => {
        // given
        const model = AssessmentProgression.create({
          assessmentType: 'SMART_PLACEMENT'
        });

        // when
        const _maxSteps = model.get('_maxSteps');

        // then
        expect(_maxSteps).to.equal(5);
      });
    });
  });

  describe('@valueNow', function() {

    it('should return the percentage of completion', () => {
      // given
      const model = AssessmentProgression.create({
        _currentStep: 2,
        _maxSteps: 10
      });

      // when
      const valueNow = model.get('valueNow');

      // then
      expect(valueNow).to.equal(20);
    });
  });

  describe('@text', function() {

    it('should return the text display in progression bar', () => {
      // given
      const model = AssessmentProgression.create({
        _currentStep: 2,
        _maxSteps: 10
      });

      // when
      const text = model.get('text');

      // then
      expect(text).to.equal('2/10');
    });
  });
});
