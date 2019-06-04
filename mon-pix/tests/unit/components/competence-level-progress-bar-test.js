import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Competence-level-progress-bar ', function() {

  setupTest();

  describe('#Computed Properties behaviors: ', function() {

    describe('#widthOfProgressBar', function() {
      [
        { level: 1, expectedValue: 'width : 12.5%' },
        { level: 2, expectedValue: 'width : 25%' },
        { level: 0, expectedValue: 'width : 24px' },
        { level: 3, expectedValue: 'width : 37.5%' },
        { level: 4, expectedValue: 'width : 50%' },
        { level: 5, expectedValue: 'width : 62.5%' },
        { level: 6, expectedValue: 'width : 75%' },
        { level: 7, expectedValue: 'width : 87.5%' },
        { level: 8, expectedValue: 'width : 100%' },
      ].forEach(({ level, expectedValue }) => {

        it(`should return ${expectedValue} when the level is ${level}`, function() {
          // given
          const component = this.owner.lookup('component:competence-level-progress-bar');
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
