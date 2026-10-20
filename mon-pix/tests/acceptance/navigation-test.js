import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Navbar', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    [
      {
        initialRoute: '/certifications',
        initialLabel: 'navigation.main.certifications',
        expectedRoute: '/accueil',
        targetLabel: 'navigation.main.dashboard',
      },
      {
        initialRoute: '/accueil',
        initialLabel: 'navigation.main.dashboard',
        expectedRoute: '/certifications',
        targetLabel: 'navigation.main.certifications',
      },
    ].forEach((userNavigation) => {
      test(`should redirect from "${userNavigation.initialRoute}" to "${userNavigation.expectedRoute}"`, async function (assert) {
        // given
        const screen = await visit(userNavigation.initialRoute);

        assert.ok(
          screen
            .getByRole('link', { name: t(userNavigation.initialLabel) })
            .getAttribute('class')
            .includes('active'),
        );
        // when
        await click(screen.getByRole('link', { name: t(userNavigation.targetLabel) }));

        // then
        assert.strictEqual(currentURL(), userNavigation.expectedRoute);
        assert.ok(
          screen
            .getByRole('link', { name: t(userNavigation.targetLabel) })
            .getAttribute('class')
            .includes('active'),
        );
      });
    });

    test('should not display while in campaign', async function (assert) {
      // given
      const campaign = server.create('campaign', 'withOneChallenge');

      // when
      await resumeCampaignOfTypeAssessmentByCode(campaign.code, false);

      // then
      assert.dom('.navbar-desktop-header').doesNotExist();
      assert.dom('.navbar-mobile-header').doesNotExist();
    });
  });
});
