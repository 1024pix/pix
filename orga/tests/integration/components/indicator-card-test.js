import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | indicator-card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders title', async function(assert) {
    await render(hbs`<IndicatorCard @title="some title" />`);

    assert.contains('some title');
  });

  test('it renders icon', async function(assert) {
    await render(hbs`<IndicatorCard @icon="archive" />`);

    assert.dom('[data-icon="archive"]').exists();
  });

  test('it renders children', async function(assert) {
    await render(hbs`<IndicatorCard>Text</IndicatorCard>`);

    assert.contains('Text');
  });

  module('when there is no additional information', function() {
    test('it does not display question mark and its tooltip', async function(assert) {
      await render(hbs`<IndicatorCard>Text</IndicatorCard>`);

      assert.dom('[data-icon="question-circle"]').doesNotExist();
      assert.dom('[role="tooltip"]').doesNotExist();
    });

    test('it display question mark and its tooltip', async function(assert) {
      await render(hbs`<IndicatorCard @info="some additional information">Text</IndicatorCard>`);

      assert.dom('[data-icon="question-circle"]').exists();
      assert.dom('[role="tooltip"]').exists();
      assert.contains('some additional information');
    });
  });
});
