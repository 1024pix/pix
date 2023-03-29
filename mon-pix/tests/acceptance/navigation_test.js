import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
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
        initialNavigationItem: 2,
        expectedRoute: '/accueil',
        targetedNavigationItem: 0,
      },
      {
        initialRoute: '/accueil',
        initialNavigationItem: 0,
        expectedRoute: '/certifications',
        targetedNavigationItem: 2,
      },
    ].forEach((userNavigation) => {
      test(`should redirect from "${userNavigation.initialRoute}" to "${userNavigation.expectedRoute}"`, async function (assert) {
        // given
        await visit(userNavigation.initialRoute);

        assert.ok(
          find('.navbar-desktop-header-container__menu')
            .children[0].children[userNavigation.initialNavigationItem].children[0].getAttribute('class')
            .includes('active')
        );

        // when
        await click(
          find('.navbar-desktop-header-container__menu').children[0].children[userNavigation.targetedNavigationItem]
            .children[0]
        );

        // then
        assert.strictEqual(currentURL(), userNavigation.expectedRoute);
        assert.ok(
          find('.navbar-desktop-header-container__menu')
            .children[0].children[userNavigation.targetedNavigationItem].children[0].getAttribute('class')
            .includes('active')
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
