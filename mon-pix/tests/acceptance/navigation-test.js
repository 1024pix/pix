import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateAsSimpleUser } from '../helpers/testing';

describe('Acceptance | Navbar', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateAsSimpleUser();
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
        await visit(usecase.initialRoute);
        expect(find(usecase.initialNavigationItem).attr('class')).to.contain('active');

        // when
        await click(usecase.targetedNavigationItem);

        // then
        expect(currentURL()).to.equal(usecase.expectedRoute);
        expect(find(usecase.targetedNavigationItem).attr('class')).to.contain('active');
      });
    });

    it('should contain link to pix.fr/aide', async function() {
      // given
      await visit('/profil');

      // when
      const faqLink = findWithAssert('.navbar-desktop-header-menu__item:nth-child(4)');

      // then
      expect(faqLink.attr('href').trim()).to.equal('https://pix.fr/aide');
    });
  });
});
