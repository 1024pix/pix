import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click , fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject } from 'rsvp';

module('Integration | Component | login-form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('input.login-form__field--identification').exists();
    assert.dom('input.login-form__field--password').exists();
  });

  test('should hide error message by default', async function(assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('p.login-form__error').doesNotExist();
  });

  module('Error management', function(hooks) {

    let sessionStub;

    hooks.beforeEach(function() {
      sessionStub = Service.extend({});
      this.owner.register('service:session', sessionStub);
    });

    test('should display error message when it is set', async function(assert) {
      // given
      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);
      assert.dom('p.login-form__error').doesNotExist();

      // when
      this.set('errorMessage', 'Some error message');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText('Some error message');
    });

    test('should display good error message when an error 401 occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: '401' }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@example.com');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), 'Identifiants de connexion invalides.');
    });

    test('should display good error message when an error 400 occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: '400' }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), 'Syntaxe (de requête) invalide.');
    });

    test('should display good error message when an undefined error occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: '500' }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@example.com');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), 'Un problème est survenu.');
    });
  });

});
