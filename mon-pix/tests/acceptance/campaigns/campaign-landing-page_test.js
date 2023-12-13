import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../../helpers/setup-intl';
import { authenticate } from '../../helpers/authentication';

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
              await click(screen.getByRole('button', { name: 'Français' }));
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
              await click(screen.getByRole('button', { name: 'English' }));
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
        .dom(
          screen.getByText(
            `${this.intl.t('pages.autonomous-course.landing-page.texts.title')} ${autonomousCourse.title}`,
          ),
        )
        .exists();
      assert.dom(screen.getByText('Dummy landing page text')).exists();
    });
  });
});
