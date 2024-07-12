import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Analysis::RecommendationIndicator', function (hooks) {
  setupIntlRenderingTest(hooks);
  let screen;

  test('should display recommendation indicator with a level of 4 for value 0', async function (assert) {
    // given
    this.value = 0;

    // when
    screen = await render(hbs`<Campaign::Analysis::RecommendationIndicator @value={{this.value}} />`);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-review.table.analysis.recommendations.very-strongly-recommended')))
      .exists();
  });

  test('should display recommendation indicator with a level of 4 for value 25', async function (assert) {
    // given
    this.value = 25;

    // when
    screen = await render(hbs`<Campaign::Analysis::RecommendationIndicator @value={{this.value}} />`);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-review.table.analysis.recommendations.very-strongly-recommended')))
      .exists();
  });

  test('should display recommendation indicator with a level of 3 for value 50', async function (assert) {
    // given
    this.value = 50;

    // when
    screen = await render(hbs`<Campaign::Analysis::RecommendationIndicator @value={{this.value}} />`);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-review.table.analysis.recommendations.strongly-recommended')))
      .exists();
  });

  test('should display recommendation indicator with a level of 2 for value 75', async function (assert) {
    // given
    this.value = 75;

    // when
    screen = await render(hbs`<Campaign::Analysis::RecommendationIndicator @value={{this.value}} />`);

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-review.table.analysis.recommendations.recommended'))).exists();
  });

  test('should display recommendation indicator with a level of 1 for value 100', async function (assert) {
    // given
    this.value = 100;

    // when
    screen = await render(hbs`<Campaign::Analysis::RecommendationIndicator @value={{this.value}} />`);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-review.table.analysis.recommendations.moderately-recommended')))
      .exists();
  });
});
