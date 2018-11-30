import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Competence-level-progress-bar ', function() {

  setupTest('component:competence-level-progress-bar', {});

  describe('#Computed Properties behaviors: ', function() {

    describe('#limitedLevel', function() {

      [
        { level: 8, expectedValue: 5 },
        { level: 7, expectedValue: 5 },
        { level: 6, expectedValue: 5 },
        { level: 5, expectedValue: 5 },
        { level: 4, expectedValue: 4 },
        { level: 3, expectedValue: 3 },
        { level: 2, expectedValue: 2 },
        { level: 1, expectedValue: 1 },
        { level: 0, expectedValue: 0 },
        { level: -1, expectedValue: -1 },
      ].forEach(({ level, expectedValue }) => {

        it(`should return ${expectedValue} when the level of the competence is ${level}`, function() {
          // given
          const component = this.subject();
          const competence = { level };

          // when
          component.set('competence', competence);

          // then
          expect(component.get('limitedLevel')).to.equal(expectedValue);
        });
      });
    });

    describe('#widthOfProgressBar', function() {
      [
        { level: 1, expectedValue: 'width : 12.5%' },
        { level: 2, expectedValue: 'width : 25%' },
        { level: 0, expectedValue: 'width : 24px' },
        { level: 3, expectedValue: 'width : 37.5%' },
        { level: 4, expectedValue: 'width : 50%' },
        { level: 5, expectedValue: 'width : 62.5%' },
        { level: 6, expectedValue: 'width : 62.5%' },
        { level: 7, expectedValue: 'width : 62.5%' },
        { level: 8, expectedValue: 'width : 62.5%' },
      ].forEach(({ level, expectedValue }) => {

        it(`should return ${expectedValue} when the level is ${level}`, function() {
          // given
          const component = this.subject();
          const competence = { level };

          // when
          component.set('competence', competence);

          // then
          expect(component.get('widthOfProgressBar').string).to.equal(expectedValue);
        });
      });
    });

    describe('#canUserStartCourse', function() {

      it('should be true when there is associated course and the competence is not assessed', function() {
        // given
        const component = this.subject();
        const competence = { courseId: 'REC123', isAssessed: false };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserStartCourse')).to.be.true;
      });

      it('should be false when there is associated course and the competence is already assessed', function() {
        // given
        const component = this.subject();
        const competence = { courseId: 'REC123', isAssessed: true };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserStartCourse')).to.be.false;
      });

      it('should be false when there is associated course and the competence is being assessed', function() {
        // given
        const component = this.subject();
        const competence = { courseId: 'REC123', isBeingAssessed: true };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserStartCourse')).to.be.false;
      });

      [
        { courseId: null },
        { courseId: undefined },
        { courseId: '' },
        { courseId: 0 },
      ].forEach(({ courseId }) => {

        it('should return false, when there is no associated course', function() {
          // given
          const component = this.subject();
          const competence = { courseId, level: -1 };

          // when
          component.set('competence', competence);

          // then
          expect(component.get('canUserStartCourse')).to.be.false;
        });
      });

    });

    describe('#canUserResumeAssessment', function() {

      it('should return true if assessmentId is defined and competence is being assessed', function() {
        // given
        const component = this.subject();
        const competence = { assessmentId: 'awesomeId', isBeingAssessed: true };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserResumeAssessment')).to.equal(true);
      });

      it('should return false if assessmentId is defined and competence is not being assessed', function() {
        // given
        const component = this.subject();
        const competence = { assessmentId: 'awesomeId', isBeingAssessed: false };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserResumeAssessment')).to.equal(false);
      });

      it('should return false if assessmentId is an empty string', function() {
        // given
        const component = this.subject();
        const competence = { assessmentId: '', isBeingAssessed: true };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserResumeAssessment')).to.equal(false);
      });

      it('should return false if assessmentId is not defined', function() {
        // given
        const component = this.subject();
        const competence = { assessmentId: null, isBeingAssessed: true };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserResumeAssessment')).to.equal(false);
      });

    });

    describe('#canUserRetry', function() {

      it('should be true if competence is assessed, daysBeforeNewAttempt equals 0 and courseId exist', function() {
        // given
        const component = this.subject();
        const competence = { courseId: 'REC123', isAssessed: true, daysBeforeNewAttempt: 0 };

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserRetry')).to.equal(true);
      });

      it('should be false if competence is not assessed"', function() {
        // given
        const competence = { courseId: 'REC123', isAssessed: false, daysBeforeNewAttempt: 0 };
        const component = this.subject();

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserRetry')).to.equal(false);
      });

      it('should be false if daysBeforeNewAttempt is not 0', function() {
        // given
        const competence = { courseId: 'REC123', isAssessed: true, daysBeforeNewAttempt: 5 };
        const component = this.subject();

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserRetry')).to.equal(false);
      });

      it('should be false if daysBeforeNewAttempt is undefined', function() {
        // given
        const competence = { courseId: 'REC123', isAssessed: true, daysBeforeNewAttempt: undefined };
        const component = this.subject();

        // when
        component.set('competence', competence);

        // then
        expect(component.get('canUserRetry')).to.equal(false);
      });

    });

  });
});
