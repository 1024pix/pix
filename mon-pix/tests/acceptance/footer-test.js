import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Footer', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is connected', function (hooks) {
    hooks.beforeEach(async function () {
      const user = server.create('user', 'withEmail');
      await authenticate(user);
    });

    const pagesWithFooter = [
      { name: 'dashboard', url: '/' },
      { name: 'competences', url: '/competences' },
      { name: 'campagne fill code', url: '/campagnes' },
      { name: 'certifications', url: '/certifications' },
      { name: 'my certifications', url: '/mes-certifications' },
      { name: 'my tutorials', url: '/mes-tutos' },
      { name: 'my courses', url: '/mes-parcours' },
      { name: 'my account', url: '/mon-compte' },
      { name: 'sitemap', url: '/plan-du-site' },
    ];

    pagesWithFooter.forEach(function (page) {
      test(`should be displayed while in ${page.name} page`, async function (assert) {
        // when
        await visit(page.url);

        // then
        assert.dom('#footer').exists();
      });
    });
  });

  test('should not be displayed while in campaign', async function (assert) {
    // given
    const campaign = server.create('campaign', 'withOneChallenge', {
      isSimplifiedAccess: true,
    });

    // when
    await resumeCampaignOfTypeAssessmentByCode(campaign.code, false);

    // then
    assert.dom('#footer').doesNotExist();
  });
});
