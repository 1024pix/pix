import EmberObject from '@ember/object';
import { resolve, reject } from 'rsvp';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByLabel } from '../../helpers/click-by-label';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';

module('Integration | Component | reset password form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    module('When component is rendered,', function () {
      test(`renders all the necessary elements of the form `, async function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { getExtension: sinon.stub().returns('org') };

        // when
        const screen = await render(hbs`<ResetPasswordForm />`);

        // then
        assert.dom(screen.getByRole('img', { name: "Page d'accueil de Pix.org" })).exists();
        assert
          .dom(screen.getByRole('link', { name: "Page d'accueil de Pix.org" }))
          .hasProperty('href', 'https://pix.org/');
        assert.dom(screen.getByText('Saisissez votre nouveau mot de passe')).exists();
        assert.dom(screen.getByLabelText('Mot de passe')).exists();
        assert.dom(screen.getByRole('button', { name: 'Envoyer' })).exists();
      });

      test('should display user’s fullName', async function (assert) {
        // given
        const user = { fullName: 'toto riri' };
        this.set('user', user);

        // when
        const screen = await render(hbs`<ResetPasswordForm @user={{this.user}} />`);

        // then
        assert.dom(screen.getByRole('heading', { name: 'toto riri' })).exists();
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

        const screen = await render(hbs`<ResetPasswordForm @user={{this.user}} @temporaryKey={{this.temporaryKey}} />`);

        // when
        const passwordInput = screen.getByLabelText('Mot de passe');
        await fillIn(passwordInput, validPassword);
        await triggerEvent(passwordInput, 'change');

        await clickByLabel(this.intl.t('pages.reset-password.actions.submit'));

        // then
        assert.true(isSaveMethodCalled);
        assert.deepEqual(saveMethodOptions, { adapterOptions: { updatePassword: true, temporaryKey: 'temp-key' } });
        assert.deepEqual(this.user.password, null);
        assert.dom(screen.queryByLabelText('Mot de passe')).doesNotExist();
        assert.dom(screen.getByText('Votre mot de passe a été modifié avec succès.')).exists();
      });

      test('should get an error, when button is clicked and saving return error', async function (assert) {
        // given
        const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save: saveWithRejection });
        this.set('user', user);
        const validPassword = 'Pix 1 2 3!';
        const screen = await render(hbs`<ResetPasswordForm @user={{this.user}} />`);

        const passwordInput = screen.getByLabelText('Mot de passe');

        // when
        await fillIn(passwordInput, validPassword);
        await triggerEvent(passwordInput, 'change');
        await clickByLabel(this.intl.t('pages.reset-password.actions.submit'));

        // then
        assert.true(isSaveMethodCalled);
        assert.deepEqual(this.user.password, validPassword);
        assert.strictEqual(find(passwordInput).value, validPassword);
        assert.dom('.form-textfield__message--error').exists();
      });
    });
  });
});
