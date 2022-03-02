import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { visit } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

describe('Acceptance | Challenge page banner', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();
  let user;
  let campaign;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { title: 'SomeTitle' });
    await authenticateByEmail(user);
  });

  context('When user is starting a campaign assessment', function () {
    it('should display a campaign banner', async function () {
      // when
      await visit(`campagnes/${campaign.code}`);
      await click('.campaign-landing-page__start-button');
      await clickByLabel(this.intl.t('pages.tutorial.pass'));

      // then
      find('.assessment-banner');
    });

    it('should display accessibility information in the banner', async function () {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      await visit(`campagnes/${campaign.code}`);
      await clickByLabel(this.intl.t('pages.tutorial.pass'));
      const title = find('.assessment-banner__title');
      const a11yText = title.firstChild.textContent;

      // then
      expect(a11yText).to.equal("Épreuve pour l'évaluation : ");
    });

    it('should display the campaign name in the banner', async function () {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      await visit(`campagnes/${campaign.code}`);
      await clickByLabel(this.intl.t('pages.tutorial.pass'));
      const title = find('.assessment-banner__title');
      const campaignName = title.lastChild.textContent;

      // then
      expect(campaignName).to.equal(campaign.title);
    });
  });
});
