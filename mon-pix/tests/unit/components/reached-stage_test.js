import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | reached-stage', function (hooks) {
  setupTest(hooks);

  const acquiredStarImgSrc = 'stage-plain-star.svg';
  const unacquiredStarImgSrc = 'stage-clear-star.svg';
  let component;

  [
    { starCount: 1, stageCount: 3, expectedAcquiredStarsCount: 0, expectedUnacquiredStarsCount: 2 },
    { starCount: 5, stageCount: 5, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 0 },
    { starCount: 5, stageCount: 6, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 1 },
    { starCount: 2, stageCount: 10, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 8 },
  ].map(({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
    module(`starCount=${starCount} and stageCount=${stageCount}`, function (hooks) {
      hooks.beforeEach(function () {
        component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
      });

      module('#get totalStarsCount', function () {
        test(`should return ${expectedAcquiredStarsCount + expectedUnacquiredStarsCount}`, function (assert) {
          const totalStarsCount = component.totalStarsCount;

          const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(totalStarsCount, totalStars);
        });
      });

      module('#get acquiredStarsCount', function () {
        test(`should return ${expectedAcquiredStarsCount}`, function (assert) {
          // given
          const component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });

          // then
          assert.deepEqual(component.acquiredStarsCount, expectedAcquiredStarsCount);
        });
      });
    });
  });

  module('has no acquired star', function () {
    [{ starCount: 1, stageCount: 3, expectedAcquiredStarsCount: 0, expectedUnacquiredStarsCount: 2 }].map(
      ({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
        module(`starCount=${starCount} and stageCount=${stageCount}`, function (hooks) {
          hooks.beforeEach(function () {
            component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
          });

          module('#get firstStar', function () {
            test('should return first star with its image', function (assert) {
              const firstStar = component.firstStar;

              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line qunit/no-assert-equal
              assert.equal(firstStar.imageSrc, unacquiredStarImgSrc);
            });
          });

          module('#get otherStars', function (hooks) {
            let otherStars;

            hooks.beforeEach(function () {
              otherStars = component.otherStars;
            });

            test('should return correct count of stars minus the first one', function (assert) {
              const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;

              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line qunit/no-assert-equal
              assert.equal(otherStars.length, totalStars - 1);
            });

            test('should return correct image for each star', function (assert) {
              const firstStarCount = 1;
              const acquiredStarsCount = otherStars.filter((star) => star.imageSrc === acquiredStarImgSrc).length;
              const unacquiredStarsCount = otherStars.filter((star) => star.imageSrc === unacquiredStarImgSrc).length;

              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line qunit/no-assert-equal
              assert.equal(acquiredStarsCount, expectedAcquiredStarsCount);
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line qunit/no-assert-equal
              assert.equal(unacquiredStarsCount + firstStarCount, expectedUnacquiredStarsCount);
            });
          });
        });
      }
    );
  });

  module('has acquired at least one star', function () {
    [
      { starCount: 5, stageCount: 5, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 0 },
      { starCount: 5, stageCount: 6, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 1 },
      { starCount: 2, stageCount: 10, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 8 },
      { starCount: 2, stageCount: 3, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 1 },
      { starCount: 4, stageCount: 5, expectedAcquiredStarsCount: 3, expectedUnacquiredStarsCount: 1 },
    ].map(({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
      module(`starCount=${starCount} and stageCount=${stageCount}`, function (hooks) {
        hooks.beforeEach(function () {
          component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
        });

        module('#get firstStar', function () {
          test('should return first star with its image', function (assert) {
            const firstStar = component.firstStar;

            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line qunit/no-assert-equal
            assert.equal(firstStar.imageSrc, acquiredStarImgSrc);
          });
        });

        module('#get otherStars', function (hooks) {
          let otherStars;

          hooks.beforeEach(function () {
            otherStars = component.otherStars;
          });

          test('should return correct count of stars minus the first one', function (assert) {
            const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;

            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line qunit/no-assert-equal
            assert.equal(otherStars.length, totalStars - 1);
          });

          test('should return correct image for each star', function (assert) {
            const firstStarCount = 1;
            const acquiredStarsCount = otherStars.filter((star) => star.imageSrc === acquiredStarImgSrc).length;
            const unacquiredStarsCount = otherStars.filter((star) => star.imageSrc === unacquiredStarImgSrc).length;

            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line qunit/no-assert-equal
            assert.equal(acquiredStarsCount + firstStarCount, expectedAcquiredStarsCount);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line qunit/no-assert-equal
            assert.equal(unacquiredStarsCount, expectedUnacquiredStarsCount);
          });
        });
      });
    });
  });
});
