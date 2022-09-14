/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Integration | Component | navbar-mobile-header', function () {
  setupIntlRenderingTest();

  context('when user is not logged', function () {
    beforeEach(async function () {
      // given & when
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
      setBreakpoint('tablet');
      await render(hbs`<NavbarMobileHeader />`);
    });

    it('should be rendered', function () {
      // then
      expect(find('.navbar-mobile-header__container')).to.exist;
    });

    it('should display the Pix logo', async function () {
      // when
      const screen = await render(hbs`<NavbarMobileHeader />`);

      // then
      expect(screen.getByRole('link', { name: this.intl.t('navigation.homepage') })).to.exist;
    });

    it('should not display the burger menu', function () {
      // then
      expect(find('.navbar-mobile-header__burger-icon')).to.not.exist;
    });
  });

  context('When user is logged', function () {
    beforeEach(function () {
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.owner.register('service:currentUser', Service.extend({ user: { fullName: 'John Doe' } }));
      setBreakpoint('tablet');
    });

    it('should be rendered', async function () {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      expect(find('.navbar-mobile-header')).to.exist;
    });

    it('should display the Pix logo', async function () {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      expect(find('.navbar-mobile-header-logo__pix')).to.exist;
    });

    it('should display the burger icon', async function () {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      expect(find('.navbar-mobile-header__burger-icon')).to.exist;
    });
  });

  it('should not display marianne logo when url does not have frenchDomainExtension', async function () {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    expect(find('.navbar-mobile-header-logo__marianne')).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function () {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    const screen = await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    expect(screen.getByRole('img', { name: this.intl.t('common.french-republic') })).to.exist;
  });
});
