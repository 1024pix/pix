import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | reached-stage', function() {
  setupIntlRenderingTest();

  beforeEach(function() {
    // given
    this.set('reachedStageStarCount', 3);
    this.set('percentage', 50);
    this.set('stageCount', 5);
  });

  it('should render the reached stage', async function() {
    // when
    await render(hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @percentage={{this.percentage}} @stageCount={{this.stageCount}} />`);

    // then
    expect(find('.reached-stage-score__stars')).to.exist;
    expect(find('.reached-stage-score__percentage-text').textContent.trim()).to.equal('50 % de réussite');
    _expectStars(this.reachedStageStarCount, this.stageCount);
  });

  describe('stars rendering', function() {
    [
      { starCount: 0, stageCount: 1 },
      { starCount: 5, stageCount: 5 },
      { starCount: 5, stageCount: 6 },
      { starCount: 2, stageCount: 10 },
      { starCount: 2, stageCount: 3 },
      { starCount: 4, stageCount: 5 },
    ].map(({ starCount, stageCount }) => {
      it(`displays ${starCount} plain stars out of ${stageCount} stars`, async function() {
        // given
        this.set('reachedStageStarCount', starCount);
        this.set('stageCount', stageCount);

        // when
        await render(hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @percentage={{this.percentage}} @stageCount={{this.stageCount}} />`);

        // then
        _expectStars(starCount, stageCount);
      });
    });
  });
});

function _expectStars(starCount, stageCount) {
  const fullStarCount = starCount > 0 ? starCount - 1 : 0;
  const fullStarElement = findAll('.reached-stage-score__stars img[data-test-status=\'acquired\']');
  const emptyStarElement = findAll('.reached-stage-score__stars img[data-test-status=\'unacquired\']');

  expect(fullStarElement.length).to.equal(fullStarCount);
  expect(emptyStarElement.length).to.equal(stageCount - starCount);
}
