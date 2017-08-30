import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | navbar-header', function() {

  setupComponentTest('header-navbar', {
    integration: true
  });

  describe('Rendering when user is not logged', function() {
    beforeEach(function() {
      this.register('service:session', Ember.Service.extend({ isAuthenticated: false }));
      this.inject.service('session', { as: 'session' });

      this.render(hbs`{{navbar-header}}`);
    });

    it('renders', function() {
      expect(this.$()).to.have.length(1);
    });

    it('should display the Pix logo', function() {
      expect(this.$('.navbar-header-logo')).to.have.lengthOf(1);
      expect(this.$('.pix-logo')).to.have.lengthOf(1);
    });

    it('should display a link to "project" page', function() {
      expect(this.$('.navbar-header-links__link--project')).to.have.lengthOf(1);
    });

    it('should display a link to "referential" page', function() {
      expect(this.$('.navbar-header-links__link--competences')).to.have.lengthOf(1);
      expect(this.$('.navbar-header-links--user-logged')).to.have.length(0);
    });
  });
  describe('Rendering for logged user', function() {

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
  });
});
