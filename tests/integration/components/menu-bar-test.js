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
    assert.dom('a.menu-bar__link--organizations').hasText('Organisations');
  });

  test('should contain link to "users" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--users').exists();
    assert.dom('a.menu-bar__link--users').hasText('Utilisateurs');
  });

  test('should contain link to "certifications" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--certifications').exists();
    assert.dom('a.menu-bar__link--certifications').hasText('Certifications');
  });

  test('should contain link to "operating" management page', async function(assert) {
    // when
    await render(hbs`{{menu-bar}}`);

    // then
    assert.dom('a.menu-bar__link--operating').exists();
    assert.dom('a.menu-bar__link--operating').hasText('Exploitation');
  });
});
