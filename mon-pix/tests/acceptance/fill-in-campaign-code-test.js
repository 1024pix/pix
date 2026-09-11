import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';
import { waitForDialog } from '../helpers/wait-for';

module('Acceptance | Fill in campaign code page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
  });

  module('When connected', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    test('should disconnect when clicking on the link', async function (assert) {
      // given
      await visit('/campagnes');

      // when
      await clickByLabel(t('pages.fill-in-campaign-code.warning-message-logout'));

      // then
      assert.strictEqual(currentURL(), '/deconnexion');
    });

    module('when code is linked to a combined course', function () {
      test('it redirects to combined course page', async function (assert) {
        // given
        const verifiedCode = server.create('verified-code', { id: 'SOMETHING', type: 'combined-course' });
        server.create('organization-to-join', { id: 1, code: verifiedCode.id, identityProvider: null });
        server.create('combined-course', { code: verifiedCode.id });

        // when
        const screen = await visit(`/campagnes`);
        await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), verifiedCode.id);
        await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

        // then
        assert.strictEqual(currentURL(), `/parcours/${verifiedCode.id}`);
      });
      module('when access to combined course is forbidden', function () {
        test('it displays oups page', async function (assert) {
          // given
          const verifiedCode = server.create('verified-code', { id: 'SOMETHING', type: 'combined-course' });
          this.server.create('organization-to-join', { id: 1, code: verifiedCode.id, identityProvider: null });
          this.server.create('combined-course', { code: verifiedCode.id });
          this.server.patch(
            'combined-courses/:code/reassess-status',
            () => new Response(403, {}, { errors: [{ code: 403 }] }),
          );
          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), verifiedCode.id);

          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), `/parcours/oups`);
        });
      });
      module('when combined courses feature is disabled', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticate(user);
          this.server.create('feature-toggle', {
            id: 0,
            areCombinedCoursesEnabled: false,
          });
        });

        test('it displays combined course error page', async function (assert) {
          // given
          const verifiedCode = server.create('verified-code', { id: 'SOMETHING', type: 'combined-course' });
          this.server.create('combined-course', { code: verifiedCode.id });
          this.server.get(
            'verified-codes/:code',
            () => new Response(422, {}, { errors: [{ status: '422', code: 'DISABLED_FEATURE' }] }),
          );

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), verifiedCode.id);

          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), `/parcours/erreur`);
        });
      });
      module('when access to combined course has failed', function () {
        test('it displays error page', async function (assert) {
          // given
          const verifiedCode = server.create('verified-code', { id: 'SOMETHING', type: 'combined-course' });
          this.server.create('organization-to-join', { id: 1, code: verifiedCode.id, identityProvider: null });
          this.server.create('combined-course', { code: verifiedCode.id });
          this.server.patch(
            'combined-courses/:code/reassess-status',
            () => new Response(500, {}, { errors: [{ code: 500, message: 'An error occured' }] }),
          );

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), verifiedCode.id);

          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.ok(screen.getByText('An error occured', { exact: false }));
        });
      });
    });
  });

  module('when user is not connected to his Mediacentre', function () {
    module('when code is linked to a campaign', function () {
      module('and starts a campaign with GAR as identity provider', function () {
        test('should not redirect the user and display a modal', async function (assert) {
          // given
          const campaign = server.create('campaign', {
            organizationId: 1,
            targetProfileName: 'My Profile',
            organizationName: 'AWS',
          });
          server.create('organization-to-join', { id: 1, code: campaign.code, identityProvider: 'GAR' });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.ok(
            await screen.findByRole('dialog', {
              title: t('pages.fill-in-campaign-code.mediacentre-start-campaign-modal.title'),
            }),
          );
        });

        module('and wants to continue', function () {
          test('should be redirected to the campaign entry page', async function (assert) {
            // given
            const campaign = server.create('campaign', {
              organizationId: 1,
              targetProfileName: 'My Profile',
              organizationName: 'AWS',
            });

            server.create('organization-to-join', { id: 1, code: campaign.code, identityProvider: 'GAR' });

            // when
            const screen = await visit(`/campagnes`);
            await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), campaign.code);
            await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
            await waitForDialog();
            await click(screen.getByRole('link', { name: 'Continuer' }));

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/programme`);
          });
        });

        module('and wants to connect to his Mediacentre', function () {
          test('should stay on the same page after closing the modal', async function (assert) {
            // given
            const campaign = server.create('campaign', {
              organizationId: 1,
              targetProfileName: 'My Profile',
              organizationName: 'AWS',
            });

            server.create('organization-to-join', { id: 1, code: campaign.code, identityProvider: 'GAR' });

            // when
            const screen = await visit(`/campagnes`);
            await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), campaign.code);
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
          server.create('organization-to-join', { id: 1, code: campaign.code, identityProvider: null });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/programme`);
        });
      });
    });

    module('when code is linked to a combined course', function () {
      module('and starts a combined course with GAR as identity provider', function () {
        test('should not redirect the user and display a modal', async function (assert) {
          // given
          const combinedCourse = server.create('combined-course', { code: 'SOMETHING' });
          server.create('organization-to-join', { id: 1, code: combinedCourse.code, identityProvider: 'GAR' });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), combinedCourse.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.ok(
            await screen.findByRole('dialog', {
              title: t('pages.fill-in-campaign-code.mediacentre-start-campaign-modal.title'),
            }),
          );
        });

        module('and wants to continue', function () {
          test('should be redirected to the combined course entry page', async function (assert) {
            // given
            const combinedCourse = server.create('combined-course', { code: 'SOMETHING' });
            server.create('organization-to-join', {
              id: 1,
              code: combinedCourse.code,
              identityProvider: 'GAR',
              type: 'SCO',
              isRestricted: true,
            });

            // when
            const screen = await visit(`/campagnes`);
            await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), combinedCourse.code);
            await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
            await waitForDialog();
            await click(screen.getByRole('link', { name: 'Continuer' }));

            // then
            assert.strictEqual(currentURL(), '/organisations/SOMETHING/rejoindre/identification');
          });
        });

        module('and wants to connect to his Mediacentre', function () {
          test('should stay on the same page after closing the modal', async function (assert) {
            // given
            const combinedCourse = server.create('combined-course', { code: 'SOMETHING' });
            server.create('organization-to-join', { id: 1, code: combinedCourse.code, identityProvider: 'GAR' });

            // when
            const screen = await visit(`/campagnes`);
            await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), combinedCourse.code);
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
          server.create('organization-to-join', { id: 1, code: campaign.code, identityProvider: null });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(`${t('pages.fill-in-campaign-code.label')} *`), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

          // then
          assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/programme`);
        });
      });
    });
  });

  module('on international domain (.org)', function () {
    module('when connected', function () {
      module('when accessing the fill in campaign code page with "Français" as default language', function () {
        test('does not display the locale switcher', async function (assert) {
          // given & when
          await authenticate(user);
          const screen = await visit('/campagnes');

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.dom(screen.getByRole('button', { name: 'Accéder au parcours' })).exists();
          assert.dom(screen.queryByRole('button', { name: 'Français' })).doesNotExist();
        });
      });
    });

    module('when not connected', function () {
      module('when accessing the fill in campaign code page with "Français" as default language', function () {
        test('displays the fill in campaign code page with "Français" as selected language', async function (assert) {
          // given & when
          const screen = await visit('/campagnes');

          // then
          assert.strictEqual(currentURL(), '/campagnes');
          assert.dom(screen.getByRole('button', { name: 'Accéder au parcours' })).exists();
        });

        module('when the user select "English" as his language', function () {
          test('displays the fill in campaign code page with "English" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/campagnes');
            await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'English' }));

            // then
            assert.strictEqual(currentURL(), '/campagnes');
            assert.dom(screen.getByRole('button', { name: 'Start' })).exists();
          });
        });
      });

      module('when accessing the fill in campaign code page with "English" as selected language', function () {
        test('displays the fill in campaign code page with "English"', async function (assert) {
          // given && when
          const screen = await visit('/campagnes?lang=en');

          // then
          assert.strictEqual(currentURL(), '/campagnes?lang=en');
          assert.dom(screen.getByRole('button', { name: 'Start' })).exists();
        });

        module('when the user select "Français" as his language', function () {
          test('displays the fill in campaign code page with "Français" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/campagnes?lang=en');
            await click(screen.getByRole('button', { name: 'Select a language' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'Français' }));

            // then
            assert.strictEqual(currentURL(), '/campagnes');
            assert.dom(screen.getByRole('button', { name: 'Accéder au parcours' })).exists();
          });
        });
      });
    });
  });
});
