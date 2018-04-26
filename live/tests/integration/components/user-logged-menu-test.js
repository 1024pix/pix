import { resolve, reject } from 'rsvp';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';

describe('Integration | Component | user logged menu', function() {
  setupComponentTest('user-logged-menu', {
    integration: true
  });

  describe('when rendering for logged user', function() {

    beforeEach(function() {
      // given
      this.register('service:store', Service.extend({
        findRecord() {
          return resolve({
            firstName: 'FHI',
            lastName: '4EVER',
            email: 'FHI@4EVER.fr'
          });
        }
      }));

      this.register('service:session', Service.extend({
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

    it('should display link to user certifications', function() {
      // when
      this.render(hbs`{{user-logged-menu _canDisplayMenu=true}}`);

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.lengthOf(1);
        expect(this.$('.user-menu-item__certification-link')).to.have.lengthOf(1);
        expect(this.$('.user-menu-item__certification-link').text()).to.contains('MES COMPETENCES');
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

    it('should hide user menu, when the menu is opened then closed', function() {
      // when
      this.$('.logged-user-name').click();
      this.$('.logged-user-name').click();

      return wait().then(() => {
        // then
        expect(this.$('.logged-user-menu')).to.have.lengthOf(0);
      });
    });

    describe('button rendering', function() {

      context('when the user is on compte page', function() {
        it('should not render a button link to the "profile" page', function() {
          this.register('service:-routing', Service.extend({
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

        it('should not render a button link to the "board" page', function() {
          this.register('service:-routing', Service.extend({
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
      });

      it('should render a button link to the profile when the user is not on compte page', function() {
        this.register('service:-routing', Service.extend({
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
      this.register('service:store', Service.extend({
        findRecord() {
          return reject();
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
