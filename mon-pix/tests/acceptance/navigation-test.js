import { click, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateByEmail } from '../helpers/authentification';
import {
  completeCampaignAndSeeResultsByCode,
  resumeCampaignByCode
} from '../helpers/campaign';
import visitWithAbortedTransition from '../helpers/visit';

describe('Acceptance | Navbar', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    [
      {
        initialRoute: '/certifications', initialNavigationItem: '.navbar-desktop-header-menu__item:nth-child(3)',
        expectedRoute: '/profil', targetedNavigationItem: '.navbar-desktop-header-menu__item:nth-child(1)',
      },
      {
        initialRoute: '/profil', initialNavigationItem: '.navbar-desktop-header-menu__item:nth-child(1)',
        expectedRoute: '/campagnes', targetedNavigationItem: '.navbar-desktop-header-menu__item:nth-child(2)'
      },
      {
        initialRoute: '/campagnes', initialNavigationItem: '.navbar-desktop-header-menu__item:nth-child(2)',
        expectedRoute: '/certifications', targetedNavigationItem: '.navbar-desktop-header-menu__item:nth-child(3)'
      },
    ].forEach((usecase) => {
      it(`should redirect from "${usecase.initialRoute}" to "${usecase.expectedRoute}"`, async function() {
        // given
        await visitWithAbortedTransition(usecase.initialRoute);
        expect(find(usecase.initialNavigationItem).getAttribute('class')).to.contain('active');

        // when
        await click(usecase.targetedNavigationItem);

        // then
        expect(currentURL()).to.equal(usecase.expectedRoute);
        expect(find(usecase.targetedNavigationItem).getAttribute('class')).to.contain('active');
      });
    });

    it.skip('should not display in skill review page', async function() {
      // when
      await resumeCampaignByCode('AZERTY2');
      await completeCampaignAndSeeResultsByCode('AZERTY2');

      // then
      expect(find('.navbar-desktop-header')).to.not.exist;
      expect(find('.navbar-mobile-header')).to.not.exist;
    });

    it('should contain link to pix.fr/aide', async function() {
      // when
      await visitWithAbortedTransition('/profil');

      // then
      expect(find('.navbar-desktop-header-menu__item:nth-child(4)').getAttribute('href')).to.equal('https://pix.fr/aide');
    });
  });
});
