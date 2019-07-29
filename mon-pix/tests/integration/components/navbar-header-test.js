import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpointForIntegrationTest } from 'mon-pix/tests/helpers/responsive';

describe('Integration | Component | navbar-header', function() {

  setupRenderingTest();

  context('when user is not logged', function() {
    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
    });

    it('should be rendered', async function() {
      // when
      await render(hbs`{{navbar-header}}`);

      // then
      expect(find('.navbar-header')).to.exist;
    });

    it('should display the Pix logo', async function() {
      // when
      await render(hbs`{{navbar-header}}`);

      // then
      expect(find('.navbar-header-logo')).to.exist;
      expect(find('.pix-logo')).to.exist;
    });

    it('should not display the navigation menu', async function() {
      // when
      await render(hbs`{{navbar-header}}`);

      // then
      expect(find('.navbar-header-container__menu')).to.not.exist;
    });

    context('when screen has a desktop size', function() {
      it('should display a desktop menu', async function() {
        // given
        setBreakpointForIntegrationTest(this, 'desktop');

        // when
        await render(hbs`{{navbar-header media=media}}`);

        // then
        expect(find('.navbar-desktop-menu')).to.exist;
        expect(find('.navbar-mobile-menu')).to.not.exist;
      });
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

      await render(hbs`{{navbar-header}}`);
    });

    it('should be rendered', function() {
      expect(find('.navbar-header')).to.exist;
    });

    it('should display the Pix logo', async function() {
      // when
      await render(hbs`{{navbar-header}}`);

      // then
      expect(find('.navbar-header-logo')).to.exist;
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

    context('when screen has a desktop size', function() {
      it('should display a desktop menu', async function() {
        // given
        setBreakpointForIntegrationTest(this, 'desktop');

        // when
        await render(hbs`{{navbar-header media=media}}`);

        // then
        expect(find('.navbar-desktop-menu')).to.exist;
      });

      it('should display the navigation menu', async function() {
        // when
        await render(hbs`{{navbar-header}}`);

        // then
        expect(find('.navbar-header-container__menu')).to.exist;
      });

      it('should display the navigation menu with expected elements', async function() {
        // given
        setBreakpointForIntegrationTest(this, 'desktop');

        // when
        await render(hbs`{{navbar-header media=media}}`);

        // then
        expect(findAll('.navbar-header-menu__item')).to.have.lengthOf(4);
        expect(findAll('.navbar-header-menu__item')[0].textContent.trim()).to.equal('Profil');
        expect(findAll('.navbar-header-menu__item')[1].textContent.trim()).to.equal('Parcours');
        expect(findAll('.navbar-header-menu__item')[2].textContent.trim()).to.equal('Certification');
        expect(findAll('.navbar-header-menu__item')[3].textContent.trim()).to.equal('Aide');
      });
    });

  });
});
