import { click, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import visit from '../helpers/visit';

describe('Acceptance | Navbar', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    [
      {
        initialRoute: '/certifications', initialNavigationItem: 1,
        expectedRoute: '/profil', targetedNavigationItem: 0,
      },
      {
        initialRoute: '/profil', initialNavigationItem: 0,
        expectedRoute: '/certifications', targetedNavigationItem: 1,
      },
    ].forEach((userNavigation) => {
      it(`should redirect from "${userNavigation.initialRoute}" to "${userNavigation.expectedRoute}"`, async function() {
        // given
        await visit(userNavigation.initialRoute);
        expect(find('.navbar-desktop-header-container__menu').children[userNavigation.initialNavigationItem].children[0]
          .getAttribute('class')).to.contain('active');

        // when
        await click(find('.navbar-desktop-header-container__menu').children[userNavigation.targetedNavigationItem].children[0]);

        // then
        expect(currentURL()).to.equal(userNavigation.expectedRoute);
        expect(find('.navbar-desktop-header-container__menu').children[userNavigation.targetedNavigationItem].children[0]
          .getAttribute('class')).to.contain('active');
      });
    });

    it('should not display while in campaign', async function() {
      // given
      const campaign = server.create('campaign', 'withOneChallenge');

      // when
      await resumeCampaignOfTypeAssessmentByCode(campaign.code, false);

      // then
      expect(find('.navbar-desktop-header')).to.not.exist;
      expect(find('.navbar-mobile-header')).to.not.exist;
    });

    it('should contain link to pix.fr/aide', async function() {
      // given
      const helpItem = find('.navbar-desktop-header-container__menu').children[3];
      const helpLink = helpItem.children[0].getAttribute('href');
      // when
      await visit('/profil');

      // then
      expect(helpLink).to.equal('https://pix.fr/aide');
    });
  });
});
