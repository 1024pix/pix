import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | organization-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{organization-form}}`);

    // then
    assert.dom('.organization-form').exists();
  });
});
