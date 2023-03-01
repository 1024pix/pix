import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | reached-stage', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    // given
    this.set('reachedStage', 3);
    this.set('rate', 0.5);
    this.set('totalStage', 5);
  });

  module('stars rendering', function () {
    [
      { reachedStage: 1, totalStage: 2 },
      { reachedStage: 5, totalStage: 5 },
      { reachedStage: 5, totalStage: 6 },
      { reachedStage: 2, totalStage: 10 },
      { reachedStage: 2, totalStage: 3 },
      { reachedStage: 4, totalStage: 5 },
    ].map(({ reachedStage, totalStage }) => {
      test(`displays ${reachedStage} plain stars out of ${totalStage} stars`, async function (assert) {
        // given
        this.set('reachedStage', reachedStage);
        this.set('totalStage', totalStage);

        // when
        const screen = await render(
          hbs`<ReachedStage @reachedStage={{this.reachedStage}} @masteryRate={{this.rate}} @totalStage={{this.totalStage}} />`
        );
        // then
        assert.ok(
          screen.getByLabelText(
            this.intl.t('pages.skill-review.stage.starsAcquired', { acquired: reachedStage - 1, total: totalStage - 1 })
          )
        );
      });
    });
  });
});
