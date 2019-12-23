import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Integration | Component | navbar-mobile-header', function() {

  setupRenderingTest();

  context('when user is not logged', function() {
    beforeEach(async function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
      setBreakpoint('tablet');
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

    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      setBreakpoint('tablet');
    });

    it('should be rendered', async function() {
      // when
      await render(hbs`{{navbar-mobile-header media=media}}`);

      // then
      expect(find('.navbar-mobile-header')).to.exist;
    });

    it('should display the Pix logo', async function() {
      // when
      await render(hbs`{{navbar-mobile-header media=media}}`);

      // then
      expect(find('.navbar-mobile-header-logo__pix')).to.exist;
      expect(find('.navbar-mobile-header-logo__marianne')).to.exist;
    });

    it('should display the burger icon', async function() {
      // when
      await render(hbs`{{navbar-mobile-header media=media burger="burger"}}`);

      // then
      expect(find('.navbar-mobile-header__burger-icon')).to.exist;
    });
  });
});
