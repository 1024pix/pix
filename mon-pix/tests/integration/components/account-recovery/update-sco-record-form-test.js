import '@ember/service';

import { render } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | account-recovery | update-sco-record', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('displays new reset password form', function (hooks) {
    hooks.beforeEach(async function () {
      const newEmail = 'philippe.example.net';
      const firstName = 'Philippe';

      this.set('firstName', firstName);
      this.set('email', newEmail);
    });

    test('displays common content for all users', async function (assert) {
      // given
      this.set('hasGarAuthenticationMethod', false);
      this.set('hasScoUsername', false);

      // when
      const screen = await render(
        hbs`<AccountRecovery::UpdateScoRecordForm
  @firstName={{this.firstName}}
  @email={{this.email}}
  @hasGarAuthenticationMethod={{this.hasGarAuthenticationMethod}}
  @hasScoUsername={{this.hasScoUsername}}
/>`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.update-sco-record.welcome-message', { firstName: this.firstName }),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.update-sco-record.form.choose-password')));
      assert.ok(
        screen.getByRole('textbox', {
          name: t('pages.account-recovery.update-sco-record.form.email-label'),
          exact: false,
        }),
      );
      assert.ok(
        screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), { exact: false }),
      );

      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.ok(submitButton);
      assert.true(submitButton.disabled);
      assert.ok(screen.getByText(t('common.actions.quit')));
      assert.dom(screen.getByRole('checkbox', { name: t('common.cgu.label') })).exists();
      assert.ok(screen.getByRole('link', { name: t('common.cgu.cgu') }));
      assert.ok(screen.getByRole('link', { name: t('common.cgu.data-protection-policy') }));
    });

    test('displays no school connection removal warning when user has no school connections', async function (assert) {
      // given
      this.set('hasGarAuthenticationMethod', false);
      this.set('hasScoUsername', false);

      // when
      await render(
        hbs`<AccountRecovery::UpdateScoRecordForm
  @firstName={{this.firstName}}
  @email={{this.email}}
  @hasGarAuthenticationMethod={{this.hasGarAuthenticationMethod}}
  @hasScoUsername={{this.hasScoUsername}}
/>`,
      );

      // then
      assert.dom('#removal-notice').doesNotExist();
      assert.dom('#new-connection-info').doesNotExist();
    });

    test('displays specific removal warning when user has username and GAR authentication method', async function (assert) {
      // given
      this.set('hasGarAuthenticationMethod', true);
      this.set('hasScoUsername', true);
      const garConnection = t('pages.account-recovery.update-sco-record.form.sco-connections.gar');
      const usernameConnection = t('pages.account-recovery.update-sco-record.form.sco-connections.username');
      const newConnectionInfo = t('pages.account-recovery.update-sco-record.form.new-connection-info');

      const formatter = new Intl.ListFormat('fr', {
        style: 'long',
        type: 'conjunction',
      });

      const scoConnectionsText = formatter.format([garConnection, usernameConnection]);

      const expectedRemovalNotice = t(
        'pages.account-recovery.update-sco-record.form.authentication-methods-removal-notice',
        { connections: scoConnectionsText },
      );

      // when
      await render(
        hbs`<AccountRecovery::UpdateScoRecordForm
  @firstName={{this.firstName}}
  @email={{this.email}}
  @hasGarAuthenticationMethod={{this.hasGarAuthenticationMethod}}
  @hasScoUsername={{this.hasScoUsername}}
/>`,
      );

      // then
      assert.dom('#removal-notice').includesText(expectedRemovalNotice);
      assert.dom('#new-connection-info').includesText(newConnectionInfo);
    });

    test('displays specific removal warning when user has username and no GAR authentication method', async function (assert) {
      // given
      this.set('hasGarAuthenticationMethod', false);
      this.set('hasScoUsername', true);

      const usernameConnection = t('pages.account-recovery.update-sco-record.form.sco-connections.username');
      const expectedRemovalNotice = t(
        'pages.account-recovery.update-sco-record.form.authentication-methods-removal-notice',
        { connections: usernameConnection },
      );
      const newConnectionInfo = t('pages.account-recovery.update-sco-record.form.new-connection-info');

      // when
      await render(
        hbs`<AccountRecovery::UpdateScoRecordForm
  @firstName={{this.firstName}}
  @email={{this.email}}
  @hasGarAuthenticationMethod={{this.hasGarAuthenticationMethod}}
  @hasScoUsername={{this.hasScoUsername}}
/>`,
      );

      // then
      assert.dom('#removal-notice').includesText(expectedRemovalNotice);
      assert.dom('#new-connection-info').includesText(newConnectionInfo);
    });

    test('displays specific removal warning when user has GAR authentication method and no username', async function (assert) {
      // given
      this.set('hasGarAuthenticationMethod', true);
      this.set('hasScoUsername', false);
      const garConnection = t('pages.account-recovery.update-sco-record.form.sco-connections.gar');
      const expectedRemovalNotice = t(
        'pages.account-recovery.update-sco-record.form.authentication-methods-removal-notice',
        { connections: garConnection },
      );
      const newConnectionInfo = t('pages.account-recovery.update-sco-record.form.new-connection-info');

      // when
      await render(
        hbs`<AccountRecovery::UpdateScoRecordForm
  @firstName={{this.firstName}}
  @email={{this.email}}
  @hasGarAuthenticationMethod={{this.hasGarAuthenticationMethod}}
  @hasScoUsername={{this.hasScoUsername}}
/>`,
      );

      // then
      assert.dom('#removal-notice').includesText(expectedRemovalNotice);
      assert.dom('#new-connection-info').includesText(newConnectionInfo);
    });
  });

  module('Form submission', function () {
    test('disables submission if password is not valid', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), { exact: false }),
        'pass',
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.true(submitButton.disabled);
    });

    test('disables submission if password is valid and cgu and data protection policy are not accepted', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), { exact: false }),
        'pix123A*',
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.true(submitButton.disabled);
    });

    test('disables submission on form when is loading', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm @isLoading={{true}} />`);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), { exact: false }),
        'pix123A*',
      );
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.true(submitButton.disabled);
    });

    test('enables submission if password is valid and cgu and data protection policy are accepted', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillIn(
        screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), { exact: false }),
        'pix123A*',
      );
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.false(submitButton.disabled);
    });
  });

  module('Error messages', function () {
    module('when the user enters a valid password', function () {
      test('does not display an error message on focus-out', async function (assert) {
        // given
        const validPassword = 'pix123A*';
        const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);
        const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
          exact: false,
        });

        // when
        await fillIn(passwordInput, validPassword);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.notOk(screen.queryByText(t('pages.account-recovery.update-sco-record.form.errors.invalid-password')));
      });
    });

    module('when the user enters an invalid password', function () {
      test('displays an invalid format error message on focus-out', async function (assert) {
        // given
        const newEmail = 'philippe.example.net';
        const firstName = 'Philippe';
        this.set('firstName', firstName);
        this.set('email', newEmail);
        const invalidPassword = 'invalidpassword';

        const screen = await render(
          hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}} />`,
        );
        const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
          exact: false,
        });

        // when
        await fillIn(passwordInput, invalidPassword);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.ok(screen.getByText(t('pages.account-recovery.update-sco-record.form.errors.invalid-password')));
      });

      test('displays a required field error message on focus-out if password field is empty', async function (assert) {
        // given
        const password = '';
        const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);
        const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
          exact: false,
        });

        // when
        await fillIn(passwordInput, password);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.ok(screen.getByText(t('pages.account-recovery.update-sco-record.form.errors.empty-password')));
      });
    });
  });
});
