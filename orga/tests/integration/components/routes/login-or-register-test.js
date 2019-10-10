import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/login-or-register', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{routes/login-or-register}}`);

    // then
    assert.dom('.login-or-register').exists();
  });

  test('it toggle the register form by default', async function(assert) {
    // when
    await render(hbs`{{routes/login-or-register}}`);

    // then
    assert.dom('.register-form').exists();
  });

  test('it toggle the login form on click on login button', async function(assert) {
    // given
    await render(hbs`{{routes/login-or-register}}`);

    // when
    await click('#login');

    // then
    assert.dom('.login-form').exists();
  });

  test('it toggle the register form on click on register button', async function(assert) {
    // given
    await render(hbs`{{routes/login-or-register}}`);

    // when
    await click('#login');
    await click('#register');

    // then
    assert.dom('.register-form').exists();
  });
});
