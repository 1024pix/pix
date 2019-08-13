import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpointForIntegrationTest } from '../../helpers/responsive';

describe('Integration | Component | navbar-desktop-header', function() {

  setupRenderingTest();

  context('when user is not logged', function() {
    beforeEach(async function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
      setBreakpointForIntegrationTest(this, 'desktop');
      await render(hbs`{{navbar-desktop-header media=media}}`);
    });

    it('should render', function() {
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

    it('should display link to inscription page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.exist;
    });

    it('should display link to connection page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.exist;
    });
  });

  context('When user is logged', function() {

    beforeEach(async function() {
      this.owner.register('service:session', Service.extend({
        isAuthenticated: true,
        data: {
          authenticated: {
            token: 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUyMTg5MDh9.bbbb',
            userId: 1,
            source: 'pix'
          }
        }
      }));
      setBreakpointForIntegrationTest(this, 'desktop');
      await render(hbs`{{navbar-desktop-header media=media}}`);
    });

    it('should be rendered', function() {
      expect(find('.navbar-desktop-header')).to.exist;
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

    it('should not display link to inscription page', function() {
      // then
      expect(find('.navbar-menu-signup-link')).to.not.exist;
    });

    it('should not display link to connection page', function() {
      // then
      expect(find('.navbar-menu-signin-link')).to.not.exist;
    });

    it('should display the navigation menu with expected elements outside of campaign results', function() {
      // then
      expect(find('.navbar-desktop-header-container__menu')).to.exist;
      expect(findAll('.navbar-desktop-header-menu__item')).to.have.lengthOf(4);
      expect(findAll('.navbar-desktop-header-menu__item')[0].textContent.trim()).to.equal('Profil');
      expect(findAll('.navbar-desktop-header-menu__item')[1].textContent.trim()).to.equal('Parcours');
      expect(findAll('.navbar-desktop-header-menu__item')[2].textContent.trim()).to.equal('Certification');
      expect(findAll('.navbar-desktop-header-menu__item')[3].textContent.trim()).to.equal('Aide');
    });
  });

});
