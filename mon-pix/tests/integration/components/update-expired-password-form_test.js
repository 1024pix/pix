import { module, test } from 'qunit';
import sinon from 'sinon';
import { fillIn, triggerEvent, click } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

import ENV from '../../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const PASSWORD_INPUT_LABEL = '* Mot de passe (8 caractères minimum, dont une majuscule, une minuscule et un chiffre)';

module('Integration | Component | update-expired-password-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders elements', async function (assert) {
    // given / when
    const screen = await render(hbs`{{update-expired-password-form}}`);

    //then
    assert.dom(screen.getByRole('heading', { name: 'Réinitialiser le mot de passe' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Réinitialiser' })).exists();
    assert.dom(screen.getByLabelText(PASSWORD_INPUT_LABEL)).exists();
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

      const screen = await render(
        hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), newPassword);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'change');

      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      assert.dom(screen.queryByLabelText(PASSWORD_INPUT_LABEL)).doesNotExist();
      assert.dom(screen.getByText('Votre mot de passe a été mis à jour.')).exists();
    });
  });

  module('errors cases', function () {
    test('should display an error, when saving fails', async function (assert) {
      // given
      const resetExpiredPasswordDemand = EmberObject.create({
        login: 'toto',
        password: 'Password123',
        updateExpiredPassword: sinon.stub().rejects(),
        unloadRecord: sinon.stub(),
      });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);
      const newPassword = 'Pix12345!';

      const screen = await render(
        hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL), newPassword);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL), 'change');

      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      assert.ok(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY));
    });
  });
});
