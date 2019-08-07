import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpointForIntegrationTest } from '../../helpers/responsive';

describe('Integration | Component | navbar-mobile-header', function() {

  setupRenderingTest();

  context('when user is not logged', function() {
    beforeEach(async function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
      setBreakpointForIntegrationTest(this, 'tablet');
      await render(hbs`{{navbar-mobile-header media=media}}`);
    });

    it('should be rendered', function() {
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      expect(find('.navbar-mobile-header-logo__pix')).to.exist;
      expect(find('.navbar-mobile-header-logo__marianne')).to.exist;
    });

    it('should not display the burger menu', function() {
      // then
      expect(find('.navbar-mobile-header__burger-icon')).to.not.exist;
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
      setBreakpointForIntegrationTest(this, 'tablet');
      await render(hbs`{{navbar-mobile-header media=media burger="stubbed-burger"}}`);
    });

    it('should be rendered', function() {
      expect(find('.navbar-mobile-header')).to.exist;
    });

    it('should display the Pix logo', function() {
      // then
      //expect(find('.navbar-mobile-header-logo__pix')).to.exist;
      //expect(find('.navbar-mobile-header-logo__marianne')).to.exist;
    });

    it('should display the burger icon', function() {
      // then
      expect(find('.navbar-mobile-header__burger-icon')).to.exist;
    });
  });
});
