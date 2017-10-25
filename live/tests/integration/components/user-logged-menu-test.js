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

  describe('when rendering for logged user', function() {

    beforeEach(function() {
      // given
      this.register('service:store', Ember.Service.extend({
        findRecord() {
          return Ember.RSVP.resolve({
            firstName: 'FHI',
            lastName: '4EVER',
            email: 'FHI@4EVER.fr'
          });
        }
      }));

      this.register('service:session', Ember.Service.extend({
        data: { authenticated: { userId: 123 } }
      }));

      this.inject.service('store', { as: 'store' });
      this.inject.service('session', { as: 'session' });

      // when
      this.render(hbs`{{user-logged-menu}}`);
    });

    it('should render component', function() {
      // then
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should display logged user name ', function() {
      // then
      expect(this.$('.logged-user-name')).to.have.lengthOf(1);
      expect(this.$('.logged-user-name__link')).to.have.lengthOf(1);
      expect(this.$('.logged-user-name__link').text().trim()).to.be.equal('FHI 4EVER');
    });

    it('should hide user menu, when no action on user-name', function() {
      // when
      this.render(hbs`{{user-logged-menu}}`);

      // then
      expect(this.$('.logged-user-menu')).to.have.lengthOf(0);
    });

    it('should display a user menu, when user-name is clicked', function() {
      // given
      this.render(hbs`{{user-logged-menu}}`);

      // when
      this.$('.logged-user-name__link').click();

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.lengthOf(1);
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
        expect(this.$('.logged-user-menu')).to.have.lengthOf(0);
      });
    });

    it('should hide user menu, when it was previously open and user press key escape', function() {
      // when
      this.$('.logged-user-name').click();
      this.$('.logged-user-name').trigger($.Event('keydown', { keyCode: 27 }));

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.lengthOf(0);
      });
    });

    it('should hide user menu, when it was previously open and user press key escape', function() {
      // when
      this.$('.logged-user-name').click();
      this.$('.logged-user-name').click();

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.lengthOf(0);
      });
    });

    describe('button rendering', function() {

      it('should not render a button link to the profile when the user is on compte page', function() {
        this.register('service:-routing', Ember.Service.extend({
          currentRouteName: 'compte',
          generateURL: function() {
            return '/compte';
          }
        }));
        this.inject.service('-routing', { as: '-routing' });

        // when
        this.render(hbs`{{user-logged-menu}}`);
        this.$('.logged-user-name').click();

        return wait().then(() => {
          // then
          expect(this.$('.user-menu-item__account-link').length).to.equal(0);
        });
      });

      it('should not render a button link to the profile when the user is on compte page', function() {
        this.register('service:-routing', Ember.Service.extend({
          currentRouteName: 'board',
          generateURL: function() {
            return '/board';
          }
        }));
        this.inject.service('-routing', { as: '-routing' });

        // when
        this.render(hbs`{{user-logged-menu}}`);
        this.$('.logged-user-name').click();

        return wait().then(() => {
          // then
          expect(this.$('.user-menu-item__account-link').length).to.equal(0);
        });
      });

      it('should render a button link to the profile when the user is not on compte page', function() {
        this.register('service:-routing', Ember.Service.extend({
          generateURL: function() {
            return '/autreRoute';
          }
        }));
        this.inject.service('-routing', { as: '-routing' });

        // when
        this.render(hbs`{{user-logged-menu}}`);
        this.$('.logged-user-name__link').click();

        return wait().then(() => {
          // then
          expect(this.$('.user-menu-item__account-link').text().trim()).to.equal('Mon compte');
          expect(this.$('.user-menu-item__account-link').length).to.equal(1);
        });
      });

    });

  });

  describe('when user is unlogged or not found', function() {
    beforeEach(function() {
      this.register('service:store', Ember.Service.extend({
        findRecord() {
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
        expect(this.$('.logged-user-name')).to.have.lengthOf(0);
      });
    });
  });
});
