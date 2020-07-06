import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click , fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject } from 'rsvp';
import ENV from 'pix-admin/config/environment';
import sinon from 'sinon';

const NOT_PIXMASTER_MSG =  'Vous n\'avez pas les droits pour vous connecter.';

module('Integration | Component | login-form', function(hooks) {

  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // when
    await render(hbs`<LoginForm />`);

    // then
    assert.dom('input.login-form__field--identification').exists();
    assert.dom('input.login-form__field--password').exists();
  });

  test('should hide error message by default', async function(assert) {
    // when
    await render(hbs`<LoginForm />`);

    // then
    assert.dom('p.login-form__error').doesNotExist();
  });

  module('Error management', function(hooks) {

    class SessionStub extends Service {
      authenticate = sinon.stub()
    }

    let sessionStub;

    hooks.beforeEach(function() {
      this.owner.register('service:session', SessionStub);
      sessionStub = this.owner.lookup('service:session');
    });

    test('should display good error message when an error 401 occurred', async function(assert) {
      // given
      const errorResponse = { responseJSON: { errors: [{ status: ENV.APP.API_ERROR_MESSAGES.UNAUTHORIZED.CODE, detail: ENV.APP.API_ERROR_MESSAGES .UNAUTHORIZED.MESSAGE }] } };
      sessionStub.authenticate = () => reject(errorResponse);

      await render(hbs`<LoginForm />`);

      // when
      await fillIn('#identification', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText(ENV.APP.API_ERROR_MESSAGES.UNAUTHORIZED.MESSAGE);
    });

    test('should display good error message when an error 400 occurred', async function(assert) {
      // given
      const errorResponse = { responseJSON: { errors: [{ status: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.CODE , detail: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE }] } };
      sessionStub.authenticate = () => reject(errorResponse);

      await render(hbs`<LoginForm />`);

      // when
      await fillIn('#identification', 'pix@');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText(ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE);
    });

    test('should display good error message when an error 403 occurred', async function(assert) {
      // given
      const errorResponse = { responseJSON: { errors: [{ status: ENV.APP.API_ERROR_MESSAGES.FORBIDDEN , detail: NOT_PIXMASTER_MSG }] } };
      sessionStub.authenticate = () => reject(errorResponse);

      await render(hbs`<LoginForm />`);

      // when
      await fillIn('#identification', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText(NOT_PIXMASTER_MSG);
    });

    test('should display good error message when an 500 error occurred', async function(assert) {
      // given
      const errorResponse = { responseJSON: { errors: [{ status: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.CODE , detail: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE }] } };
      sessionStub.authenticate = () => reject(errorResponse);

      await render(hbs`<LoginForm />`);

      // when
      await fillIn('#identification', 'pix@example.com');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
    });

    test('should display good error message when an non handled status code', async function(assert) {
      // given
      const errorResponse = { responseJSON: { errors: [{ status: 502 , detail: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE }] } };
      sessionStub.authenticate = () => reject(errorResponse);

      await render(hbs`<LoginForm />`);

      // when
      await fillIn('#identification', 'pix@example.com');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.dom('p.login-form__error').exists();
      assert.dom('p.login-form__error').hasText(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
    });
  });

});
