/* eslint ember/no-classic-classes: 0 */

import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL, fillIn, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { clickByLabel } from '../../helpers/click-by-label';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | account-recovery | UpdateScoRecordRoute', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('and user clicks on email link', function () {
    test('should show reset password form', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await settled();

      // then
      assert.strictEqual(currentURL(), `/recuperer-mon-compte/${temporaryKey}`);

      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.update-sco-record.welcome-message', { firstName: 'George' }),
        }),
      );
    });

    test('should display an error message when account with email already exists', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
            },
          ],
        },
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.account-exists')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when user has already left SCO', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        403,
        {},
        {
          errors: [
            {
              status: '403',
            },
          ],
        },
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.title')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when temporary key not found', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
            },
          ],
        },
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.key-invalid')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when temporary key has expired', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        401,
        {},
        {
          errors: [
            {
              status: '401',
            },
          ],
        },
      );
      server.get(`/account-recovery/${temporaryKey}`, () => errorsApi);

      //when
      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByRole('link', { name: t('pages.account-recovery.errors.key-expired-renew-demand-link') }));
    });
  });

  module('and user chooses a new password and accepts cgu and data protection policy', function () {
    test('should redirect to homepage after successful password change', async function (assert) {
      // given
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const email = 'George@example.net';
      const password = 'Password123';
      server.create('user', { id: '2', email, password });

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, password);
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));

      await settled();

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });

    test('should display an error message when account with email already exists', async function (assert) {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
            },
          ],
        },
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, newPassword);

      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));

      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.account-exists')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when user has already left SCO', async function (assert) {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        403,
        {},
        {
          errors: [
            {
              status: '403',
            },
          ],
        },
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);

      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, newPassword);
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));
      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.key-used')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when temporary key not found', async function (assert) {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
            },
          ],
        },
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, newPassword);
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));

      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('pages.account-recovery.errors.key-invalid')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });

    test('should display an error message when temporary key has expired', async function (assert) {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        401,
        {},
        {
          errors: [
            {
              status: '401',
            },
          ],
        },
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, newPassword);
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));

      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByRole('link', { name: t('pages.account-recovery.errors.key-expired-renew-demand-link') }));
    });

    test('should display an error message when internal server error returned', async function (assert) {
      // given
      const newPassword = 'Pix1234*';
      const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

      const errorsApi = new Response(
        500,
        {},
        {
          errors: [
            {
              status: '500',
            },
          ],
        },
      );
      server.patch('/account-recovery', () => errorsApi);

      const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
      const passwordInput = screen.getByLabelText(t('pages.account-recovery.update-sco-record.form.password-label'), {
        exact: false,
      });
      await fillIn(passwordInput, newPassword);
      await click(screen.getByRole('checkbox', { name: t('common.cgu.label') }));

      // when
      await clickByLabel(t('pages.account-recovery.update-sco-record.form.login-button'));

      await settled();

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.errors.title'),
        }),
      );
      assert.ok(screen.getByText(t('common.api-error-messages.internal-server-error')));
      assert.ok(screen.getByRole('link', { name: t('navigation.back-to-homepage') }));
    });
  });

  test('should display on reset passord form a quit button redirecting to login page ', async function (assert) {
    // given
    const replaceLocationStub = sinon.stub().resolves();
    this.owner.register(
      'service:location',
      Service.extend({
        replace: replaceLocationStub,
      }),
    );

    const temporaryKey = '6fe76ea1bb34a1d17e7b2253ee0f7f4b2bc66ddde37d50ee661cbbf3c00cfdc9';

    // when
    const screen = await visit(`/recuperer-mon-compte/${temporaryKey}`);
    await settled();
    await click(screen.getByText(t('common.actions.quit')));

    // then
    assert.ok(replaceLocationStub.calledWith('/?lang=fr'));
  });
});
