import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component |  <%= dasherizedModuleName %>', function (hooks) {
  setupRenderingTest(hooks);

  test('replace this by your real test', async function (assert) {
    // given

    //  when
    await render(hbs`<<%= classifiedModuleName %> />`);

    // then
    assert.ok(true);
  });
});
