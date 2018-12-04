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

  });
});
