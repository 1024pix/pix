import EmberObject from '@ember/object';
import { resolve, reject } from 'rsvp';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, fillIn, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';

const PASSWORD_INPUT_CLASS = '.form-textfield__input';

module('Integration | Component | reset password form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should be rendered', async function (assert) {
      await render(hbs`<ResetPasswordForm />`);
      assert.dom('.sign-form__container').exists();
    });

    module('When component is rendered,', function () {
      [
        { item: '.pix-logo__link' },
        { item: '.sign-form-title' },
        { item: '.sign-form-header__instruction' },
        { item: '.sign-form__body' },
        { item: '.form-textfield__label' },
        { item: '.form-textfield__input-field-container' },
      ].forEach(({ item }) => {
        test(`should contains a item with class: ${item}`, async function (assert) {
          // when
          await render(hbs`<ResetPasswordForm />`);

          // then
          assert.dom(item).exists();
        });
      });

      test('should display user’s fullName', async function (assert) {
        // given
        const user = { fullName: 'toto riri' };
        this.set('user', user);

        // when
        await render(hbs`<ResetPasswordForm @user={{this.user}} />`);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(find('.sign-form-title').textContent.trim(), user.fullName);
      });
    });

    module('A submit button', function (hooks) {
      let isSaveMethodCalled, saveMethodOptions;

      const save = (options) => {
        isSaveMethodCalled = true;
        saveMethodOptions = options;
        return resolve();
      };

      const saveWithRejection = () => {
        isSaveMethodCalled = true;
        return reject({ errors: [{ status: '400' }] });
      };

      hooks.beforeEach(function () {
        isSaveMethodCalled = false;
      });

      test('should save the new password, when button is clicked', async function (assert) {
        // given
        const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save });
        this.set('user', user);
        this.set('temporaryKey', 'temp-key');
        const validPassword = 'Pix 1 2 3!';

        await render(hbs`<ResetPasswordForm @user={{this.user}} @temporaryKey={{this.temporaryKey}} />`);

        // when
        await fillIn(PASSWORD_INPUT_CLASS, validPassword);
        await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

        await clickByLabel(this.intl.t('pages.reset-password.actions.submit'));

        // then
        assert.true(isSaveMethodCalled);
        assert.deepEqual(saveMethodOptions, { adapterOptions: { updatePassword: true, temporaryKey: 'temp-key' } });
        assert.deepEqual(this.user.password, null);
        assert.dom(PASSWORD_INPUT_CLASS).doesNotExist();
        assert.dom('.password-reset-demand-form__body').exists();
      });

      test('should get an error, when button is clicked and saving return error', async function (assert) {
        // given
        const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save: saveWithRejection });
        this.set('user', user);
        const validPassword = 'Pix 1 2 3!';

        await render(hbs`<ResetPasswordForm @user={{this.user}} />`);

        // when
        await fillIn(PASSWORD_INPUT_CLASS, validPassword);
        await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

        await clickByLabel(this.intl.t('pages.reset-password.actions.submit'));

        // then
        assert.true(isSaveMethodCalled);
        assert.deepEqual(this.user.password, validPassword);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(find(PASSWORD_INPUT_CLASS).value, validPassword);
        assert.dom('.form-textfield__message--error').exists();
      });
    });
  });
});
