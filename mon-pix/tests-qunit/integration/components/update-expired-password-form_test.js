import { module, test } from 'qunit';
import sinon from 'sinon';
import { fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';

const PASSWORD_INPUT_CLASS = '.form-textfield__input';

module('Integration | Component | update-expired-password-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    // when
    await render(hbs`{{update-expired-password-form}}`);

    //then
    assert.dom(find('.update-expired-password-form__container')).exists();
  });

  module('successful cases', function () {
    test('should save the new password, when button is clicked', async function (assert) {
      // given
      const resetExpiredPasswordDemand = EmberObject.create({
        login: 'toto',
        password: 'Password123',
        updateExpiredPassword: sinon.stub(),
        unloadRecord: sinon.stub(),
      });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);
      const newPassword = 'Pix12345!';

      await render(hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`);

      // when
      await fillIn(PASSWORD_INPUT_CLASS, newPassword);
      await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

      await clickByLabel(this.intl.t('pages.update-expired-password.button'));

      // then
      assert.dom(find(PASSWORD_INPUT_CLASS)).doesNotExist();
      assert.dom(find('.password-reset-demand-form__body')).exists();
    });
  });

  module('errors cases', function () {
    test('should display an error, when saving fails', async function (assert) {
      // given
      const expectedErrorMessage = this.intl.t('api-error-messages.internal-server-error');

      const resetExpiredPasswordDemand = EmberObject.create({
        login: 'toto',
        password: 'Password123',
        updateExpiredPassword: sinon.stub().rejects(),
        unloadRecord: sinon.stub(),
      });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);
      const newPassword = 'Pix12345!';

      await render(hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`);

      // when
      await fillIn(PASSWORD_INPUT_CLASS, newPassword);
      await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

      await clickByLabel(this.intl.t('pages.update-expired-password.button'));

      // then
      assert.dom(contains(expectedErrorMessage)).exists();
    });
  });
});
