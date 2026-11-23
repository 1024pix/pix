import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { SessionStorageEntry } from 'pix-orga/utils/session-storage-entry';
import { module, test } from 'qunit';

import setupIntl, { t } from '../helpers/setup-intl';

module('Acceptance | SSO selection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  const invitationStorage = new SessionStorageEntry('joinInvitationData');

  hooks.afterEach(function () {
    invitationStorage.remove();
  });

  module('When the user logs in through SSO', function () {
    test('it displays the sso selection page for login', async function (assert) {
      // given
      const screen = await visit('/connexion/sso-selection');

      // when
      await clickByName(t('components.authentication.oidc-provider-selector.label'));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Partenaire OIDC' }));

      // then
      const heading = await screen.findByRole('heading', { name: t('pages.login.title') });
      assert.dom(heading).exists();
    });

    test('it can go back to the login page', async function (assert) {
      // given
      await visit('/connexion/sso-selection');

      // when
      await clickByName(t('common.actions.back'));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When the user joins through SSO with an invitation', function (hooks) {
    let invitation;

    hooks.beforeEach(() => {
      invitation = server.create('organizationInvitation', {
        code: 'ABCD',
        status: 'pending',
        organizationName: 'College BRO & Evil Associates',
      });
    });

    module('When the user logs in', function () {
      test('it displays the sso selection page for login', async function (assert) {
        // given
        const screen = await visit(`/connexion/sso-selection?invitationId=${invitation.id}&code=${invitation.code}`);
        assert.ok(
          screen.getByText(t('pages.login.join-invitation', { organizationName: invitation.organizationName })),
        );

        // when
        await clickByName(t('components.authentication.oidc-provider-selector.label'));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Partenaire OIDC' }));

        // then
        const heading = await screen.findByRole('heading', { name: t('pages.login.title') });
        assert.dom(heading).exists();
      });

      test('it can go back to the join page for login', async function (assert) {
        // given
        await visit(`/connexion/sso-selection?code=${invitation.code}&invitationId=${invitation.id}`);

        // when
        await clickByName(t('common.actions.back'));

        // then
        assert.strictEqual(currentURL(), `/rejoindre?code=${invitation.code}&invitationId=${invitation.id}`);
      });
    });

    module('When the user signs up', function () {
      test('it displays the sso selection page for signup', async function (assert) {
        // given
        const screen = await visit(
          `/connexion/sso-selection?invitationId=${invitation.id}&code=${invitation.code}&isForSignup=true`,
        );
        assert.ok(
          screen.getByText(t('pages.login.join-invitation', { organizationName: invitation.organizationName })),
        );

        // when
        await clickByName(t('components.authentication.oidc-provider-selector.label'));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'Partenaire OIDC' }));

        // then
        const heading = await screen.findByRole('heading', { name: t('pages.join.signup.title') });
        assert.dom(heading).exists();
      });

      test('it can go back to the join page for signup', async function (assert) {
        // given
        await visit(`/connexion/sso-selection?code=${invitation.code}&invitationId=${invitation.id}&isForSignup=true`);

        // when
        await clickByName(t('common.actions.back'));

        // then
        assert.strictEqual(
          currentURL(),
          `/rejoindre/inscription?code=${invitation.code}&invitationId=${invitation.id}`,
        );
      });
    });
  });
});
