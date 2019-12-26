import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Integration | Component | navbar-header', function() {

  setupRenderingTest();

  context('when user is on desktop', function() {
    beforeEach(async function() {
      setBreakpoint('desktop');
      await render(hbs`{{navbar-header media=media}}`);
    });

    it('should be rendered in desktop mode', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });
  });

  context('When user is not on desktop ', function() {
    beforeEach(function() {
      setBreakpoint('tablet');
    });

    it('should be rendered in mobile/tablet mode with a burger', async function() {
      // when
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.set('burger', {
        state: {
          actions: {
            toggle: () => true
          }
        }
      });
      await render(hbs`{{navbar-header media=media burger=burger }}`);
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
      expect(find('.navbar-mobile-header__burger-icon')).to.exist;
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
