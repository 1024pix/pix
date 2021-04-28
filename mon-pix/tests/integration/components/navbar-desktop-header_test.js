import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

import { contains } from '../../helpers/contains';

describe('Integration | Component | navbar-desktop-header', function() {

  setupIntlRenderingTest();

  context('when user is not logged', function() {
    beforeEach(async function() {
      class sessionService extends Service { isAuthenticated = false }
      this.owner.register('service:session', sessionService);
      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    it('should be rendered', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      expect(find('.navbar-desktop-header-logo')).to.exist;
      expect(find('.pix-logo')).to.exist;
    });

    it('should not display the navigation menu', function() {
      // then
      expect(find('.navbar-desktop-header-container__menu')).to.not.exist;
    });

    it('should display link to signup page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.exist;
    });

    it('should display link to login page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.exist;
    });

    it('should not display the link "J\'ai un code"', function() {
      expect(contains('J\'ai un code')).not.to.exist;
    });
  });

  context('When user is logged', function() {

    beforeEach(async function() {
      class sessionService extends Service {
        isAuthenticated = true
        data = {
          authenticated: {
            token: 'access_token',
            userId: 1,
            source: 'pix',
          },
        }
      }
      this.owner.register('service:session', sessionService);
      class currentUserService extends Service {
        user = { isAnonymous: false }
      }
      this.owner.register('service:currentUser', currentUserService);
      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>}`);
    });

    it('should be rendered', function() {
      expect(find('.navbar-desktop-header')).to.exist;
    });

    it('should display the link "J\'ai un code"', function() {
      expect(contains('J\'ai un code')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      expect(find('.navbar-desktop-header-logo')).to.exist;
      expect(find('.pix-logo')).to.exist;
    });

    it('should display logged user details informations', function() {
      // then
      expect(find('.logged-user-details')).to.exist;
    });

    it('should not display link to signup page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.not.exist;
    });

    it('should not display link to login page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.not.exist;
    });

    it('should display the navigation menu with expected elements', function() {
      // then
      expect(find('.navbar-desktop-header-container__menu')).to.exist;
      expect(findAll('.navbar-desktop-header-menu__item')).to.have.lengthOf(5);
      expect(contains('Accueil')).to.exist;
      expect(contains('Compétences')).to.exist;
      expect(contains('Mes tutos')).to.exist;
      expect(contains('Certification')).to.exist;
      expect(contains('J\'ai un code')).to.exist;
    });
  });

  context('when user comes from external platform', function() {
    beforeEach(async function() {
      class sessionService extends Service {
        isAuthenticated = false
        data = {
          externalUser: 'externalUserToken',
        }
      }
      this.owner.register('service:session', sessionService);

      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    it('should be rendered', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      expect(find('.navbar-desktop-header-logo')).to.exist;
      expect(find('.pix-logo')).to.exist;
    });

    it('should not display the navigation menu', function() {
      // then
      expect(find('.navbar-desktop-header-container__menu')).to.not.exist;
    });

    it('should not display link to signup page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.not.exist;
    });

    it('should not display link to login page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.not.exist;
    });

    it('should not display the join campaign link', function() {
      expect(contains('J\'ai un code')).not.to.exist;
    });
  });

  context('when logged user is anonymous', function() {
    beforeEach(async function() {
      class sessionService extends Service {
        isAuthenticated = true
      }
      this.owner.register('service:session', sessionService);
      class currentUserService extends Service {
        user = { isAnonymous: true }
      }
      this.owner.register('service:currentUser', currentUserService);

      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    it('should be rendered', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      expect(find('.navbar-desktop-header-logo')).to.exist;
      expect(find('.pix-logo')).to.exist;
    });

    it('should not display the navigation menu', function() {
      // then
      expect(find('.navbar-desktop-header-container__menu')).to.not.exist;
    });

    it('should not display link to signup page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.not.exist;
    });

    it('should not display link to login page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.not.exist;
    });

    it('should not display the join campaign link', function() {
      expect(contains('J\'ai un code')).not.to.exist;
    });
  });

  it('should not display marianne logo when url does not have frenchDomainExtension', async function() {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    expect(find('.navbar-desktop-header-logo__marianne')).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function() {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    expect(find('.navbar-desktop-header-logo__marianne')).to.exist;
  });

});
