import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Footer', function (hooks) {
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

    test('should not be displayed while in campaign', async function (assert) {
      // given
      const campaign = server.create('campaign', 'withOneChallenge');

      // when
      await resumeCampaignOfTypeAssessmentByCode(campaign.code, false);

      // then
      assert.dom('.footer').doesNotExist();
    });

    test('should contain link to pix.org/fr/support', async function (assert) {
      // when
      await visit('/');

      // then
      assert.ok(
        find('.footer-container-content__navigation ul li:nth-child(1) a')
          .getAttribute('href')
          .includes('pix.org/fr/support'),
      );
    });

    test('should contain link to pix.fr/accessibilite', async function (assert) {
      // when
      await visit('/');

      // then
      assert.ok(
        find('.footer-container-content__navigation ul li:nth-child(2) a')
          .getAttribute('href')
          .includes('/accessibilite'),
      );
    });
  });
});
