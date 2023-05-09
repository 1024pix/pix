import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component |  <%= dasherizedModuleName %>', function (hooks) {
  setupRenderingTest(hooks);

  test('replace this by your real test', async function (assert) {
    // given

    //  when
    await render(hbs`<<%= classifiedModuleName %> />`);

    // then
    assert.strictEqual(true, true);
  });
});
