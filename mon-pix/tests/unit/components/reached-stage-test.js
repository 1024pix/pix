import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | reached-stage', function() {

  setupTest();

  [
    { starCount: 0, stageCount: 1, acquiredStars: [], unacquiredStars: [1] },
    { starCount: 5, stageCount: 5, acquiredStars: [1, 2, 3, 4, 5], unacquiredStars: [] },
    { starCount: 5, stageCount: 6, acquiredStars: [1, 2, 3, 4, 5], unacquiredStars: [6] },
    { starCount: 2, stageCount: 10, acquiredStars: [1, 2], unacquiredStars: [3, 4, 5, 6, 7, 8, 9, 10] },
    { starCount: 2, stageCount: 3, acquiredStars: [1, 2], unacquiredStars: [3] },
    { starCount: 4, stageCount: 5, acquiredStars: [1, 2, 3, 4], unacquiredStars: [5] },
  ].map(({ starCount, stageCount, acquiredStars, unacquiredStars }) => {
    context(`starCount=${starCount} and stageCount=${stageCount}`, () => {
      describe('#get acquiredStars', function() {
        it(`should return ${JSON.stringify(acquiredStars)}`, function() {
          // given
          const component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });

          // then
          expect(component.acquiredStars).to.deep.equal(acquiredStars);
        });
      });

      describe('#get unacquiredStars', function() {
        it(`should return ${JSON.stringify(unacquiredStars)}`, function() {
          // given
          const component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });

          // then
          expect(component.unacquiredStars).to.deep.equal(unacquiredStars);
        });
      });
    });
  });
});

