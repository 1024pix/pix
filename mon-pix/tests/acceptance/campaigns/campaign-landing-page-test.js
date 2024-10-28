import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Campaigns | campaign-landing-page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('for campaign', function (hooks) {
    let campaign;

    hooks.beforeEach(function () {
      campaign = server.create('campaign');
    });

    module('on international domain (.org)', function () {
      module('when connected', function () {
        module('when accessing the campaign landing page with "Français" as default language', function () {
          test('does not display the language switcher', async function (assert) {
            // given
            const user = server.create('user', 'withEmail');

            // when
            await authenticate(user);
            const screen = await visit(`/campagnes/${campaign.code}`);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
            assert.dom(screen.getByRole('button', { name: 'Je commence' })).exists();
            assert.dom(screen.queryByRole('button', { name: 'Français' })).doesNotExist();
          });
        });
      });

      module('when not connected', function () {
        module('when accessing the fill in campaign code page with "Français" as default language', function () {
          test('displays the fill in campaign code page with "Français" as selected language', async function (assert) {
            // given & when
            const screen = await visit(`/campagnes/${campaign.code}`);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
            assert.dom(screen.getByRole('button', { name: 'Je commence' })).exists();
          });

          module('when the user select "English" language', function () {
            test('displays the fill in campaign code page with "English" as selected language', async function (assert) {
              // given & when
              const screen = await visit(`/campagnes/${campaign.code}`);
              await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
              await screen.findByRole('listbox');
              await click(screen.getByRole('option', { name: 'English' }));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
              assert.dom(screen.getByRole('button', { name: 'Begin' })).exists();
            });
          });
        });

        module('when accessing the fill in campaign code page with "English" as selected language', function () {
          test('displays the fill in campaign code page with "English"', async function (assert) {
            // given && when
            const screen = await visit(`/campagnes/${campaign.code}?lang=en`);

            // then
            assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
            assert.dom(screen.getByRole('button', { name: 'Begin' })).exists();
          });

          module('when the user select "Français" language', function () {
            test('displays the fill in campaign code page with "Français" as selected language', async function (assert) {
              // given & when
              const screen = await visit(`/campagnes/${campaign.code}?lang=en`);
              await click(screen.getByRole('button', { name: 'Select a language' }));
              await screen.findByRole('listbox');
              await click(screen.getByRole('option', { name: 'Français' }));

              // then
              assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
              assert.dom(screen.getByRole('button', { name: 'Je commence' })).exists();
            });
          });
        });
      });
    });
  });

  module('for autonomous course', function () {
    test('should display the autonomous course start block component', async function (assert) {
      // given
      const autonomousCourse = server.create('campaign', 'forAutonomousCourse');

      // when
      const screen = await visit(`/campagnes/${autonomousCourse.code}`);

      // then
      assert.strictEqual(currentURL(), `/campagnes/${autonomousCourse.code}/presentation`);
      assert
        .dom(screen.getByText(`${t('pages.autonomous-course.landing-page.texts.title')} ${autonomousCourse.title}`))
        .exists();
      assert.dom(screen.getByText('Dummy landing page text')).exists();
    });
  });

  module('new presentation page', function () {
    test('should display the new presentation page', async function (assert) {
      // given
      server.create('feature-toggle', { id: 0, showNewCampaignPresentationPage: true });

      const campaign = server.create('campaign');
      const user = server.create('user', 'withEmail', { hasSeenAssessmentInstructions: false });

      // when
      await authenticate(user);
      const screen = await visit(`/campagnes/${campaign.code}`);

      // then
      assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation`);
      assert.dom(screen.getByText(`Bonjour ${user.firstName} !`, { exact: false })).exists();

      await click(
        screen.getByRole('link', {
          name: t('pages.campaign.presentation.landing.start-button'),
          collapseWhitespace: true,
        }),
      );

      assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/presentation/steps`);

      assert
        .dom(screen.getByRole('heading', { name: t('pages.campaign.presentation.steps.organization.title') }))
        .exists();

      await click(screen.getByRole('button', { name: t('common.actions.continue') }));

      assert.ok(currentURL().includes('/assessment'));
    });
  });
});
