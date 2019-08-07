import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpointForIntegrationTest } from '../../helpers/responsive';

describe('Integration | Component | navbar-header', function() {

  setupRenderingTest();

  context('when user is on desktop', function() {
    beforeEach(async function() {
      setBreakpointForIntegrationTest(this, 'desktop');
      await render(hbs`{{navbar-header media=media}}`);
    });

    it('should be rendered in desktop mode', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });
  });

  context('When user is not on desktop ', function() {
    beforeEach(function() {
      setBreakpointForIntegrationTest(this, 'tablet');
    });

    it('should be rendered in mobile/tablet mode with a burger', async function() {
      // when
      await render(hbs`{{navbar-header media=media burger="stubbed-burger"}}`);
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
      //expect(find('.navbar-mobile-header__burger-icon')).to.exist;
    });

    it('should be rendered in mobile/tablet mode without burger', async function() {
      // when
      await render(hbs`{{navbar-header media=media}}`);
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
      expect(find('.navbar-mobile-header__burger-icon')).to.not.exist;
    });
  });
});
