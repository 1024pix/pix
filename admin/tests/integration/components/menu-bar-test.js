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
    assert.dom('a.menu-bar__link--organizations').exists();
  });

  test('should contain link to "users" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--users').exists();
  });

  test('should contain link to "sessions" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--sessions').exists();
  });

  test('should contain link to "certifications" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--certifications').exists();
  });

  test('should contain link to "tools" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--tools').exists();
  });

  test('should contain link to "logout"', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--logout').exists();
  });
});
