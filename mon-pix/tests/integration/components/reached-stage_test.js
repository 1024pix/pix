import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | reached-stage', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    // given
    this.set('reachedStageStarCount', 3);
    this.set('rate', 0.5);
    this.set('stageCount', 5);
  });

  test('should render the reached stage', async function (assert) {
    // when
    await render(
      hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @masteryRate={{this.rate}} @stageCount={{this.stageCount}} />`
    );

    // then
    assert.dom('.reached-stage-score__stars').exists();
    assert.equal(find('.reached-stage-score__percentage-text').textContent.trim(), '50\u00A0% de réussite');

    const fullStarCount = this.reachedStageStarCount > 0 ? this.reachedStageStarCount - 1 : 0;
    const fullStarElement = findAll(".reached-stage-score__stars img[data-test-status='acquired']");
    const emptyStarElement = findAll(".reached-stage-score__stars img[data-test-status='unacquired']");

    assert.equal(fullStarElement.length, fullStarCount);
    assert.equal(emptyStarElement.length, this.stageCount - this.reachedStageStarCount);
  });

  module('stars rendering', function () {
    [
      { starCount: 0, stageCount: 1 },
      { starCount: 5, stageCount: 5 },
      { starCount: 5, stageCount: 6 },
      { starCount: 2, stageCount: 10 },
      { starCount: 2, stageCount: 3 },
      { starCount: 4, stageCount: 5 },
    ].map(({ starCount, stageCount }) => {
      test(`displays ${starCount} plain stars out of ${stageCount} stars`, async function (assert) {
        // given
        this.set('reachedStageStarCount', starCount);
        this.set('stageCount', stageCount);

        // when
        await render(
          hbs`<ReachedStage @starCount={{this.reachedStageStarCount}} @masteryRate={{this.rate}} @stageCount={{this.stageCount}} />`
        );

        // then
        const fullStarCount = starCount > 0 ? starCount - 1 : 0;
        const fullStarElement = findAll(".reached-stage-score__stars img[data-test-status='acquired']");
        const emptyStarElement = findAll(".reached-stage-score__stars img[data-test-status='unacquired']");

        assert.equal(fullStarElement.length, fullStarCount);
        assert.equal(emptyStarElement.length, stageCount - starCount);
      });
    });
  });
});
