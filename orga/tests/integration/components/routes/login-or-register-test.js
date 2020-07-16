import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/login-or-register', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`<Routes::LoginOrRegister/>`);

    // then
    assert.dom('.login-or-register').exists();
  });

  test('it display the organization name the user is invited to', async function(assert) {
    // when
    await render(hbs`<Routes::LoginOrRegister @organizationName='Organization Aztec'/>`);

    // then
    assert.dom('.login-or-register-panel__invitation').hasText('Vous êtes invité(e) à rejoindre l\'organisation Organization Aztec');
  });

  test('it toggle the register form by default', async function(assert) {
    // when
    await render(hbs`<Routes::LoginOrRegister/>`);

    // then
    assert.dom('.register-form').exists();
  });

  test('it toggle the login form on click on login button', async function(assert) {
    // given
    await render(hbs`<Routes::LoginOrRegister/>`);

    // when
    await click('#login');

    // then
    assert.dom('.login-form').exists();
  });

  test('it toggle the register form on click on register button', async function(assert) {
    // given
    await render(hbs`<Routes::LoginOrRegister/>`);

    // when
    await click('#login');
    await click('#register');

    // then
    assert.dom('.register-form').exists();
  });
});
