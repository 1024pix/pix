import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Competence-level-progress-bar ', function() {

  setupTest('component:competence-level-progress-bar', {});

  describe('#Computed Properties behaviors: ', function() {

    describe('#hasLevel', function() {

      [
        { level: 1, expectedValue: true },
        { level: 0, expectedValue: true },
        { level: -1, expectedValue: false },
        { level: undefined, expectedValue: false }
      ].forEach(({ level, expectedValue }) => {

        it(`should return ${expectedValue} when the level of the competence is ${level}`, function() {
          // given
          const component = this.subject();

          // when
          component.set('level', level);

          // then
          expect(component.get('hasLevel')).to.equal(expectedValue);
        });

      });

    });

    describe('#widthOfProgressBar', function() {
      [
        { level: 0, expectedValue: 'width : 24px' },
        { level: 1, expectedValue: 'width : 12.5%' },
        { level: 2, expectedValue: 'width : 25%' },
        { level: 3, expectedValue: 'width : 37.5%' },
        { level: 4, expectedValue: 'width : 50%' },
        { level: 5, expectedValue: 'width : 62.5%' },
      ].forEach(({ level, expectedValue }) => {

        it(`should return ${expectedValue} when the level is ${level}`, function() {
          // given
          const component = this.subject();

          // when
          component.set('level', level);

          // then
          expect(component.get('widthOfProgressBar').string).to.equal(expectedValue);
        });

      });
    });

    describe('#canUserStartCourse', function() {
      [
        { level: null, expected: true },
        { level: undefined, expected: true },
        { level: -1, expected: true },
        { level: 1, expected: false },
        { level: 0, expected: false },
      ].forEach(({ level, expected }) => {
        it(`should return ${expected}, when there is associated course and level is ${level}`, function() {
          // given
          const component = this.subject();
          const courseId = 'REC123';
          // when
          component.set('level', level);
          component.set('courseId', courseId);

          // then
          expect(component.get('canUserStartCourse')).to.be.equal(expected);
        });
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
          const level = -1;
          // when
          component.set('level', level);
          component.set('courseId', courseId);

          // then
          expect(component.get('canUserStartCourse')).to.be.false;
        });
      });

      it('should return false, when there is associated course but have already level', function() {
        // given
        const component = this.subject();
        const level = 777;
        const courseId = 'REC123';
        // when
        component.set('level', level);
        component.set('courseId', courseId);

        // then
        expect(component.get('canUserStartCourse')).to.be.false;
      });

    });
  });

});
