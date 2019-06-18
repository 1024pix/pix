import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
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

    it('should be rendered', function() {
      expect(find('.navbar-header')).to.exist;
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
    });

  });
});
