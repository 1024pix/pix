import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | indicator-card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders children', async function(assert) {
    await render(hbs`<IndicatorCard>Text</IndicatorCard>`);

    assert.contains('Text');
  });
});
