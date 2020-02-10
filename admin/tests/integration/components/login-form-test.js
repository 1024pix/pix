import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click , fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject } from 'rsvp';
import { HttpStatusCodes } from '../../http-status-code';

const NOT_PIXMASTER_MSG =  'Vous n\'avez pas les droits pour vous connecter.';

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
      const errorResponse = { errors: [{ status: HttpStatusCodes.UNAUTHORIZED.CODE, detail: HttpStatusCodes.UNAUTHORIZED.MESSAGE }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), HttpStatusCodes.UNAUTHORIZED.MESSAGE);
    });

    test('should display good error message when an error 400 occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: HttpStatusCodes.BAD_REQUEST.CODE , detail: HttpStatusCodes.BAD_REQUEST.MESSAGE }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), HttpStatusCodes.BAD_REQUEST.MESSAGE);
    });

    test('should display good error message when an error 403 occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: HttpStatusCodes.FORBIDDEN , detail: NOT_PIXMASTER_MSG }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@example.net');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), NOT_PIXMASTER_MSG);
    });

    test('should display good error message when an undefined error occurred', async function(assert) {
      // given
      const errorResponse = { errors: [{ status: HttpStatusCodes.INTERNAL_SERVER_ERROR.CODE , detail: HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE }] };
      sessionStub.prototype.authenticate = () => reject(errorResponse);

      this.set('errorMessage', null);
      await render(hbs`{{login-form errorMessage=errorMessage}}`);

      // when
      await fillIn('#identification', 'pix@example.com');
      await fillIn('#password', 'JeMeLoggue1024');
      await click('button.login-form__button');

      // then
      assert.equal(this.get('errorMessage'), HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE);
    });
  });

});
