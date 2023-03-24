import { click, fillIn, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { waitForDialog } from '../helpers/wait-for';

module('Acceptance | Fill in campaign code page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
  });

  module('When connected', function () {
    test('should disconnect when cliking on the link', async function (assert) {
      // given
      await authenticate(user);
      const screen = await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.warning-message-logout'));

      // then
      assert.notOk(screen.queryByText(user.firstName));
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.not-logged.sign-in') }));
    });
  });

  module('Explanation link', function () {
    test('should redirect on the right support page', async function (assert) {
      // given
      await authenticate(user);
      await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.explanation-message'));

      // then
      assert
        .dom(
          '[href="https://support.pix.org/fr/support/solutions/articles/15000029147-qu-est-ce-qu-un-code-parcours-et-comment-l-utiliser-"]'
        )
        .exists();
      assert.dom('[target="_blank"]').exists();
    });
  });

  module('when user is not connected to his Mediacentre', function () {
    module('and starts a campaign with GAR as identity provider', function () {
      test('should not redirect the user and display a modal', async function (assert) {
        // given
        const campaign = server.create('campaign', {
          identityProvider: 'GAR',
          targetProfileName: 'My Profile',
          organizationName: 'AWS',
        });

        // when
        const screen = await visit(`/campagnes`);
        await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.label')), campaign.code);
        await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

        // then
        assert.strictEqual(currentURL(), '/campagnes');
        assert.ok(screen.getByText(this.intl.t('pages.fill-in-campaign-code.mediacentre-start-campaign-modal.title')));
      });

      module('and wants to continue', function () {
        test('should be redirected to the campaign entry page', async function (assert) {
          // given
          const campaign = server.create('campaign', {
            identityProvider: 'GAR',
            targetProfileName: 'My Profile',
            organizationName: 'AWS',
          });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.label')), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
          await waitForDialog();
          await click(screen.getByRole('link', { name: 'Continuer' }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
        });
      });

      module('and wants to connect to his Mediacentre', function () {
        test('should stay on the same page after closing the modal', async function (assert) {
          // given
          const campaign = server.create('campaign', {
            identityProvider: 'GAR',
            targetProfileName: 'My Profile',
            organizationName: 'AWS',
          });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.label')), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
          await waitForDialog();
          await click(screen.getByRole('button', { name: 'Quitter' }));

          // then
          assert.strictEqual(currentURL(), '/campagnes');
        });
      });
    });

    module('and starts a campaign without GAR as identity provider', function () {
      test('should redirect the user to the campaign entry page', async function (assert) {
        // given
        const campaign = server.create('campaign');

        // when
        const screen = await visit(`/campagnes`);
        await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.label')), campaign.code);
        await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

        // then
        assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
      });
    });
  });
});
