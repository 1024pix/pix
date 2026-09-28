import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';

import setupIntl, { waitLanguageChanged } from '../helpers/setup-intl';
import {
  createPrescriberByUser,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

module('Acceptance | join and login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const invitationStorage = new SessionStorageEntry('joinInvitationData');

  hooks.afterEach(function () {
    invitationStorage.remove();
  });

  module('When the invitation is valid', function (hooks) {
    let invitationId;
    let invitationCode;

    hooks.beforeEach(() => {
      invitationCode = 'ABCD';
      invitationId = server.create('organizationInvitation', {
        status: 'pending',
        code: invitationCode,
        organizationName: 'College BRO & Evil Associates',
      }).id;
    });

    test('authenticates with invitation and joins the organization', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      // when
      const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);
      assert.ok(
        screen.getByText(t('pages.login.join-invitation', { organizationName: 'College BRO & Evil Associates' })),
      );
      await fillByLabel(t('pages.login-form.email.label'), user.email);
      await fillByLabel(t('pages.login-form.password'), 'secret');
      await clickByName(t('pages.login-form.login'));

      // then
      assert.strictEqual(currentURL(), '/');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      assert.ok(screen.getByText('Harry Cover'));
    });

    module('When user has not accepted terms of service yet', function (hooks) {
      let user;

      hooks.beforeEach(() => {
        user = createUserWithMembership();
        createPrescriberByUser({ user });
      });

      test('redirects user to the terms-of-service page', async function (assert) {
        // given
        await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);
        await fillByLabel(t('pages.login-form.email.label'), user.email);
        await fillByLabel(t('pages.login-form.password'), 'secret');

        // when
        await clickByName(t('pages.login-form.login'));

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        assert.dom('.app__sidebar').doesNotExist();
        assert.dom('.main-content__topbar').doesNotExist();
      });

      test('redirects user to the terms-of-service page according its language', async function (assert) {
        // given
        const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);

        await click(screen.getByRole('button', { name: t('components.locale-switcher.label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'English' }));
        await waitLanguageChanged('en');

        await clickByName(t('pages.login-or-register.login-form.button'));
        await fillByLabel(t('pages.login-or-register.register-form.fields.email.label'), user.email);
        await fillByLabel(t('pages.login-or-register.register-form.fields.password.label'), 'secret');

        // when
        await clickByName(t('pages.login-or-register.login-form.button'));

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(screen.getByText(t('components.terms-of-service.title.requested')));
      });
    });

    module('When user is already a member of the organization', function () {
      test('logins with invitation and access the organization', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser({ user });
        server.post(
          `/organization-invitations/${invitationId}/response`,
          { errors: [{ detail: '', status: '412', title: '' }] },
          412,
        );

        // when
        const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);
        await fillByLabel(t('pages.login-form.email.label'), user.email);
        await fillByLabel(t('pages.login-form.password'), 'secret');
        await clickByName(t('pages.login-form.login'));

        // then
        assert.strictEqual(currentURL(), '/');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        assert.ok(screen.getByText('Harry Cover'));
      });
    });

    module('When user changes the language', function () {
      test('keeps invitation query params', async function (assert) {
        // given / when
        const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}&lang=en`);
        await click(screen.getByRole('button', { name: t('components.locale-switcher.label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Français' }));

        // then
        assert.ok(
          await screen.findByText(
            t('pages.login.join-invitation', { organizationName: 'College BRO & Evil Associates' }),
          ),
        );
        assert.strictEqual(currentURL(), `/rejoindre?code=${invitationCode}&invitationId=${invitationId}`);
      });
    });
  });

  module('when the invitation does not exist', function () {
    test('redirects user to /connexion', async function (assert) {
      // when
      const screen = await visit('/rejoindre?invitationId=123456&code=FAKE999');

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.ok(screen.getByText(t('pages.login-form.invitation-not-found')));
    });
  });

  module('when the invitation has already been accepted', function () {
    test('redirects user to /connexion and displays an error message', async function (assert) {
      // given
      const code = 'ABCD';
      const invitationId = server.create('organizationInvitation', { status: 'accepted', code }).id;

      // when
      const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${code}`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.ok(screen.getByText(t('pages.login-form.invitation-already-accepted')));
    });
  });

  module('when the invitation has been cancelled', function () {
    test('redirects user to /connexion and displays an error message', async function (assert) {
      // given
      const code = 'ABCD';
      const invitationId = server.create('organizationInvitation', { status: 'cancelled', code }).id;

      // when
      const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${code}`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.ok(screen.getByText(t('pages.login-form.invitation-was-cancelled')));
    });
  });
});
