import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';

import setupIntl, { waitLanguageChanged } from '../helpers/setup-intl';

module('Acceptance | join and signup', function (hooks) {
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

    test('creates a new account and access the organization', async function (assert) {
      // given
      const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);
      await clickByName(t('pages.login.signup.label'));
      assert.ok(
        screen.getByText(t('pages.login.join-invitation', { organizationName: 'College BRO & Evil Associates' })),
      );

      // when
      await fillByLabel(t('pages.join.signup.fields.firstname.label'), 'pix');
      await fillByLabel(t('pages.join.signup.fields.lastname.label'), 'pix');
      await fillByLabel(t('pages.join.signup.fields.email.label'), 'shi@fu.me');
      await fillByLabel(t('pages.join.signup.fields.password.label'), 'Password4register');
      await clickByName(t('common.cgu.label'));
      await clickByName(t('pages.join.signup.submit'));

      // then
      assert.strictEqual(currentURL(), '/cgu');
      assert.ok(screen.getByText(t('components.terms-of-service.title.requested')));
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    module('When user changes the language', function () {
      test("redirects user to the terms-of-service page in the user's language selected", async function (assert) {
        // given
        const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);

        await clickByName(t('pages.login.signup.label'));
        await fillByLabel(t('pages.join.signup.fields.firstname.label'), 'pix');
        await fillByLabel(t('pages.join.signup.fields.lastname.label'), 'pix');
        await fillByLabel(t('pages.join.signup.fields.email.label'), 'shi@fu.me');
        await fillByLabel(t('pages.join.signup.fields.password.label'), 'Password4register');
        await clickByName(t('common.cgu.label'));

        // when
        await click(screen.getByRole('button', { name: t('components.locale-switcher.label') }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'English' }));
        await waitLanguageChanged('en');
        await clickByName(t('pages.join.signup.submit'));

        // then
        assert.strictEqual(currentURL(), '/cgu');
        assert.ok(screen.getByText(t('components.terms-of-service.title.requested')));
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });
    });

    module('When user already exists', function () {
      test('displays an error message', async function (assert) {
        // given
        const alreadyExistingUserError = {
          status: '422',
          source: { pointer: 'data/attributes/email' },
          detail: 'INVALID_OR_ALREADY_USED_EMAIL',
        };
        server.post('/users', { errors: [alreadyExistingUserError] }, 422);

        // when
        const screen = await visit(`/rejoindre?invitationId=${invitationId}&code=${invitationCode}`);
        await clickByName(t('pages.login.signup.label'));
        await fillByLabel(t('pages.join.signup.fields.firstname.label'), 'pix');
        await fillByLabel(t('pages.join.signup.fields.lastname.label'), 'pix');
        await fillByLabel(t('pages.join.signup.fields.email.label'), 'shi@fu.me');
        await fillByLabel(t('pages.join.signup.fields.password.label'), 'Password4register');
        await clickByName(t('common.cgu.label'));
        await clickByName(t('pages.join.signup.submit'));

        // then
        assert.strictEqual(currentURL(), `/rejoindre/inscription?code=${invitationCode}&invitationId=${invitationId}`);
        assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
        assert.ok(screen.getByText(t('pages.join.signup.errors.invalid-or-already-used-email')));
      });
    });
  });

  module('when the invitation does not exist', function () {
    test('redirects user to /connexion', async function (assert) {
      // when
      await visit('/rejoindre/inscription?invitationId=123456&code=FAKE999');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when the invitation has already been accepted', function () {
    test('redirects user to /connexion and displays an error message', async function (assert) {
      // given
      const code = 'ABCD';
      const invitationId = server.create('organizationInvitation', { status: 'accepted', code }).id;

      // when
      const screen = await visit(`/rejoindre/inscription?invitationId=${invitationId}&code=${code}`);

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
      const screen = await visit(`/rejoindre/inscription?invitationId=${invitationId}&code=${code}`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
      assert.ok(screen.getByText(t('pages.login-form.invitation-was-cancelled')));
    });
  });
});
