import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | menu-bar', function(hooks) {
  setupRenderingTest(hooks);

  test('should contain link to "organizations" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link-organizations"]').exists();
  });

  test('should contain link to "users" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link-users"]').exists();
  });

  test('should contain link to "sessions" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar__link--sessions"]').exists();
  });

  test('should contain link to "certifications" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link-certifications"').exists();
  });

  test('should contain link to "target-profiles" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link--target-profiles"]').exists();
  });

  test('should contain link to "tools" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link-tools"]').exists();
  });

  test('should contain link to "logout"', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a[data-test-id="menu-bar-link-logout"').exists();
  });
});
