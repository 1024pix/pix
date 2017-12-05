import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { setBreakpointForIntegrationTest } from 'pix-live/tests/helpers/responsive';

describe('Integration | Component | navbar-header', function() {

  setupComponentTest('header-navbar', {
    integration: true
  });

  context('when user is not logged', function() {
    beforeEach(function() {
      this.register('service:session', Ember.Service.extend({ isAuthenticated: false }));
      this.inject.service('session', { as: 'session' });
    });

    it('should be rendered', function() {
      // when
      this.render(hbs`{{navbar-header}}`);

      // then
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should display the Pix logo', function() {
      // when
      this.render(hbs`{{navbar-header}}`);

      // then
      expect(this.$('.navbar-header-logo')).to.have.lengthOf(1);
      expect(this.$('.pix-logo')).to.have.lengthOf(1);
    });

    it('should display link to inscription page', function() {
      // when
      this.render(hbs`{{navbar-header}}`);

      // then
      expect(this.$('.navbar-menu-signup-link')).to.have.lengthOf(1);
    });

    it('should display link to connection page', function() {
      // when
      this.render(hbs`{{navbar-header}}`);

      // then
      expect(this.$('.navbar-menu-signin-link')).to.have.lengthOf(1);
    });

    context('when screen has a smartphone or tablet size', function() {
      it('should display a mobile menu', function() {
        // given
        setBreakpointForIntegrationTest(this, 'mobile');

        // when
        this.render(hbs`{{navbar-header media=media}}`);

        // then
        expect(this.$('.navbar-mobile-menu')).to.have.lengthOf(1);
        expect(this.$('.navbar-desktop-menu')).to.have.lengthOf(0);
      });
    });

    context('when screen has a desktop size', function() {
      it('should display a desktop menu', function() {
        // given
        setBreakpointForIntegrationTest(this, 'desktop');

        // when
        this.render(hbs`{{navbar-header media=media}}`);

        // then
        expect(this.$('.navbar-desktop-menu')).to.have.lengthOf(1);
        expect(this.$('.navbar-mobile-menu')).to.have.lengthOf(0);
      });
    });

  });

  context('When user is logged', function() {

    beforeEach(function() {
      this.register('service:session', Ember.Service.extend({
        isAuthenticated: true,
        data: {
          authenticated: {
            userId: 1435
          }
        }
      }));
      this.inject.service('session', { as: 'session' });

      this.render(hbs`{{navbar-header}}`);
    });

    it('should display logged user details informations', function() {
      // then
      expect(this.$('.logged-user-details')).to.have.lengthOf(1);
    });

    it('should not display link to inscription page', function() {
      // then
      expect(this.$('.navbar-menu-signup-link')).to.have.lengthOf(0);
    });

    it('should not display link to connection page', function() {
      // then
      expect(this.$('.navbar-menu-signin-link')).to.have.lengthOf(0);
    });

    it('should be rendered', function() {
      expect(this.$()).to.have.lengthOf(1);
    });

    context('when screen has a smartphone or tablet size', function() {
      it('should display a mobile menu', function() {
        // given
        setBreakpointForIntegrationTest(this, 'mobile');

        // when
        this.render(hbs`{{navbar-header media=media}}`);

        // then
        expect(this.$('.navbar-mobile-menu')).to.have.lengthOf(1);
      });
    });

    context('when screen has a desktop size', function() {
      it('should display a desktop menu', function() {
        // given
        setBreakpointForIntegrationTest(this, 'desktop');

        // when
        this.render(hbs`{{navbar-header media=media}}`);

        // then
        expect(this.$('.navbar-desktop-menu')).to.have.lengthOf(1);
      });
    });

  });
});
