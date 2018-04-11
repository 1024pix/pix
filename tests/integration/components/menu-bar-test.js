import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | menu-bar', function(hooks) {
  setupRenderingTest(hooks);

  test('should contain the application logo', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('img.menu-bar__logo-image').exists();
    assert.dom('img.menu-bar__logo-image').hasAttribute('src', '/logo-pix.png');
  });

  test('should contain link to "organizations" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--organizations').exists();
  });
});
