/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';
import { contains } from '../../helpers/contains';

describe('Integration | Component | navbar-header', function() {

  setupIntlRenderingTest();

  context('when user is on desktop', function() {
    beforeEach(async function() {
      setBreakpoint('desktop');
      await render(hbs`<NavbarHeader/>`);
    });

    it('should be rendered in desktop mode', function() {
      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should render skip links', async function() {
      expect(contains(this.intl.t('common.skip-links.skip-to-content'))).to.exist;
      expect(contains(this.intl.t('common.skip-links.skip-to-footer'))).to.exist;
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
            toggle: () => true,
          },
        },
      });
      await render(hbs`<NavbarHeader @burger={{this.burger}} />`);
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
      expect(find('.navbar-mobile-header__burger-icon')).to.exist;
    });

    it('should be rendered in mobile/tablet mode without burger', async function() {
      // when
      await render(hbs`<NavbarHeader/>`);

      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
      expect(find('.navbar-mobile-header__burger-icon')).to.not.exist;
    });

    it('should render skip links', async function() {
      await render(hbs`<NavbarHeader/>`);

      expect(contains(this.intl.t('common.skip-links.skip-to-content'))).to.exist;
      expect(contains(this.intl.t('common.skip-links.skip-to-footer'))).to.exist;
    });
  });
});
