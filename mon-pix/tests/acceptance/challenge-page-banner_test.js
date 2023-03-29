import { click, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Challenge page banner', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;
  let campaign;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { title: 'SomeTitle' });
    await authenticate(user);
  });

  module('When user is starting a campaign assessment', function () {
    test('should display a campaign banner', async function (assert) {
      // when
      await visit(`campagnes/${campaign.code}`);
      await click('.campaign-landing-page__start-button');
      await clickByLabel(this.intl.t('pages.tutorial.pass'));

      // then
      assert.ok(find('.assessment-banner'));
    });

    test('should display accessibility information in the banner', async function (assert) {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      await visit(`campagnes/${campaign.code}`);
      await clickByLabel(this.intl.t('pages.tutorial.pass'));
      const title = find('.assessment-banner__title');
      const a11yText = title.firstChild.textContent;

      // then
      assert.strictEqual(a11yText, "Épreuve pour l'évaluation : ");
    });

    test('should display the campaign name in the banner', async function (assert) {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      await visit(`campagnes/${campaign.code}`);
      await clickByLabel(this.intl.t('pages.tutorial.pass'));
      const title = find('.assessment-banner__title');
      const campaignName = title.lastChild.textContent;

      // then
      assert.strictEqual(campaignName, campaign.title);
    });
  });
});
