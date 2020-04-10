import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | recommendation-indicator', function(hooks) {
  setupRenderingTest(hooks);

  test('should display recommendation indicator with a level of 4 for value 0', async function(assert) {
    // given
    this.set('value', 0);

    // when
    await render(hbs`<RecommendationIndicator @value={{value}} />`);

    // then
    assert.dom('[aria-label="Fortement recommandé"]').exists();
  });

  test('should display recommendation indicator with a level of 4 for value 25', async function(assert) {
    // given
    this.set('value', 25);

    // when
    await render(hbs`<RecommendationIndicator @value={{value}} />`);

    // then
    assert.dom('[aria-label="Fortement recommandé"]').exists();
  });

  test('should display recommendation indicator with a level of 3 for value 50', async function(assert) {
    // given
    this.set('value', 50);

    // when
    await render(hbs`<RecommendationIndicator @value={{value}} />`);

    // then
    assert.dom('[aria-label="Très recommandé"]').exists();
  });

  test('should display recommendation indicator with a level of 2 for value 75', async function(assert) {
    // given
    this.set('value', 75);

    // when
    await render(hbs`<RecommendationIndicator @value={{value}} />`);

    // then
    assert.dom('[aria-label="Recommandé"]').exists();
  });

  test('should display recommendation indicator with a level of 1 for value 100', async function(assert) {
    // given
    this.set('value', 100);

    // when
    await render(hbs`<RecommendationIndicator @value={{value}} />`);

    // then
    assert.dom('[aria-label="Assez recommandé"]').exists();
  });
});
