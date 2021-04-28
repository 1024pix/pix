import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | reached-stage', function() {

  setupTest();

  const acquiredStarImgSrc = 'stage-plain-star.svg';
  const unacquiredStarImgSrc = 'stage-clear-star.svg';
  let component;

  [
    { starCount: 1, stageCount: 3, expectedAcquiredStarsCount: 0, expectedUnacquiredStarsCount: 2 },
    { starCount: 5, stageCount: 5, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 0 },
    { starCount: 5, stageCount: 6, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 1 },
    { starCount: 2, stageCount: 10, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 8 },
  ].map(({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
    context(`starCount=${starCount} and stageCount=${stageCount}`, () => {

      beforeEach(function() {
        component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
      });

      describe('#get totalStarsCount', function() {
        it(`should return ${expectedAcquiredStarsCount + expectedUnacquiredStarsCount}`, function() {
          const totalStarsCount = component.totalStarsCount;

          const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;
          expect(totalStarsCount).to.equal(totalStars);
        });
      });

      describe('#get acquiredStarsCount', function() {
        it(`should return ${expectedAcquiredStarsCount}`, function() {
          // given
          const component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });

          // then
          expect(component.acquiredStarsCount).to.deep.equal(expectedAcquiredStarsCount);
        });
      });
    });
  });

  context('has no acquired star', () => {
    [
      { starCount: 1, stageCount: 3, expectedAcquiredStarsCount: 0, expectedUnacquiredStarsCount: 2 },
    ].map(({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
      context(`starCount=${starCount} and stageCount=${stageCount}`, () => {

        beforeEach(function() {
          component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
        });

        describe('#get firstStar', function() {
          it('should return first star with its image', function() {
            const firstStar = component.firstStar;

            expect(firstStar.imageSrc).to.equal(unacquiredStarImgSrc);
          });
        });

        describe('#get otherStars', function() {
          let otherStars;

          beforeEach(function() {
            otherStars = component.otherStars;
          });

          it('should return correct count of stars minus the first one', function() {
            const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;

            expect(otherStars.length).to.equal(totalStars - 1);
          });

          it('should return correct image for each star', function() {
            const firstStarCount = 1;
            const acquiredStarsCount = otherStars.filter((star) => star.imageSrc === acquiredStarImgSrc).length;
            const unacquiredStarsCount = otherStars.filter((star) => star.imageSrc === unacquiredStarImgSrc).length;

            expect(acquiredStarsCount).to.equal(expectedAcquiredStarsCount);
            expect(unacquiredStarsCount + firstStarCount).to.equal(expectedUnacquiredStarsCount);
          });
        });
      });
    });
  });

  context('has acquired at least one star', () => {
    [
      { starCount: 5, stageCount: 5, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 0 },
      { starCount: 5, stageCount: 6, expectedAcquiredStarsCount: 4, expectedUnacquiredStarsCount: 1 },
      { starCount: 2, stageCount: 10, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 8 },
      { starCount: 2, stageCount: 3, expectedAcquiredStarsCount: 1, expectedUnacquiredStarsCount: 1 },
      { starCount: 4, stageCount: 5, expectedAcquiredStarsCount: 3, expectedUnacquiredStarsCount: 1 },
    ].map(({ starCount, stageCount, expectedAcquiredStarsCount, expectedUnacquiredStarsCount }) => {
      context(`starCount=${starCount} and stageCount=${stageCount}`, () => {

        beforeEach(function() {
          component = createGlimmerComponent('component:reached-stage', { starCount, stageCount });
        });

        describe('#get firstStar', function() {
          it('should return first star with its image', function() {
            const firstStar = component.firstStar;

            expect(firstStar.imageSrc).to.equal(acquiredStarImgSrc);
          });
        });

        describe('#get otherStars', function() {
          let otherStars;

          beforeEach(function() {
            otherStars = component.otherStars;
          });

          it('should return correct count of stars minus the first one', function() {
            const totalStars = expectedAcquiredStarsCount + expectedUnacquiredStarsCount;

            expect(otherStars.length).to.equal(totalStars - 1);
          });

          it('should return correct image for each star', function() {
            const firstStarCount = 1;
            const acquiredStarsCount = otherStars.filter((star) => star.imageSrc === acquiredStarImgSrc).length;
            const unacquiredStarsCount = otherStars.filter((star) => star.imageSrc === unacquiredStarImgSrc).length;

            expect(acquiredStarsCount + firstStarCount).to.equal(expectedAcquiredStarsCount);
            expect(unacquiredStarsCount).to.equal(expectedUnacquiredStarsCount);
          });
        });
      });
    });
  });

});

