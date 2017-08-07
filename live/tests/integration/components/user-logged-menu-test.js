import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | user logged menu', function() {
  setupComponentTest('user-logged-menu', {
    integration: true
  });

  describe('Default rendering for logged user', function() {

    beforeEach(function() {
      // given
      this.register('service:store', Ember.Service.extend({
        queryRecord() {
          return Ember.RSVP.resolve({
            firstName: 'FHI',
            lastName: '4EVER',
            email: 'FHI@4EVER.fr'
          });
        }
      }));
      this.inject.service('store', { as: 'store' });

      // when
      this.render(hbs`{{user-logged-menu}}`);
    });

    it('should render component', function() {
      // then
      expect(this.$()).to.have.length(1);
    });

    it('should display logged user name ', function() {
      // then
      expect(this.$('.logged-user-name')).to.have.length(1);
      expect(this.$('.logged-user-name__link')).to.have.length(1);
      expect(this.$('.logged-user-name__link').text().trim()).to.be.equal('FHI 4EVER');
    });

  });

  describe('behavior on user menu', function() {

    it('should hide user menu, when no action on user-name', function() {
      // when
      this.render(hbs`{{user-logged-menu}}`);

      // then
      expect(this.$('.logged-user-menu')).to.have.length(0);
    });

    beforeEach(function() {
      this.register('service:store', Ember.Service.extend({
        queryRecord() {
          return Ember.RSVP.resolve({
            firstName: 'FHI',
            lastName: '4EVER',
            email: 'FHI@4EVER.fr'
          });
        }
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should display a user menu, when user-name is clicked', function() {
      // given
      this.render(hbs`{{user-logged-menu}}`);

      // when
      this.$('.logged-user-name').click();

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.length(1);
        expect(this.$('.user-menu-item__details-firstname').text().trim()).to.equal('FHI');
        expect(this.$('.user-menu-item__details-email').text().trim()).to.equal('FHI@4EVER.fr');
      });
    });

    it('should hide user menu, when it was previously open and user-name is clicked one more time', function() {
      // when
      this.render(hbs`{{user-logged-menu}}`);
      this.$('.logged-user-name').click();
      this.$('.logged-user-name').click();

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.length(0);
      });
    });

  });

  describe('behavior when user is unlogged or not found', function() {

    beforeEach(function() {
      this.register('service:store', Ember.Service.extend({
        queryRecord() {
          return Ember.RSVP.reject();
        }
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should not display user information, for unlogged', function() {
      // when
      this.render(hbs`{{user-logged-menu}}`);

      // then
      return wait().then(() => {
        expect(this.$('.logged-user-name')).to.have.length(0);
      });
    });
  });
});
