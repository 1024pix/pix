import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, findAll, triggerKeyEvent, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | user logged menu', function() {

  setupRenderingTest();

  describe('when rendering for logged user', function() {

    beforeEach(async function() {
      // given
      this.owner.register('service:currentUser', Service.extend({
        user: {
          firstName: 'FHI',
          email: 'FHI@4EVER.fr',
          fullName: 'FHI 4EVER',
        }
      }));

      // when
      await render(hbs`{{user-logged-menu}}`);
    });

    it('should render component', function() {
      // then
      expect(find('.logged-user-details')).to.exist;
    });

    it('should display logged user name ', function() {
      // then
      expect(find('.logged-user-name')).to.exist;
      expect(find('.logged-user-name__link')).to.exist;
      expect(find('.logged-user-name__link').textContent.trim()).to.be.equal('FHI 4EVER');
    });

    it('should hide user menu, when no action on user-name', async function() {
      // when
      await render(hbs`{{user-logged-menu}}`);

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });

    it('should display a user menu, when user-name is clicked', async function() {
      // given
      await render(hbs`{{user-logged-menu}}`);

      // when
      await click('.logged-user-name__link');

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.exist;
        expect(find('.user-menu-item__details-firstname').textContent.trim()).to.equal('FHI');
        expect(find('.user-menu-item__details-email').textContent.trim()).to.equal('FHI@4EVER.fr');
      });
    });

    it('should display link to user certifications', async function() {
      // when
      await render(hbs`{{user-logged-menu _canDisplayMenu=true}}`);

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.exist;
        expect(findAll('.user-menu-item__link')).to.have.lengthOf(1);
        expect(findAll('.user-menu-item__link')[0].textContent.trim()).to.equal('MES CERTIFICATIONS');
      });
    });

    it('should hide user menu, when it was previously open and user-name is clicked one more time', async function() {
      // when
      await render(hbs`{{user-logged-menu}}`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.not.exist;
      });
    });

    it('should hide user menu, when it was previously open and user press key escape', async function() {
      // when
      await click('.logged-user-name');
      await triggerKeyEvent('.logged-user-name', 'keydown', 27);

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.not.exist;
      });
    });

    it('should hide user menu, when the menu is opened then closed', async function() {
      // when
      await click('.logged-user-name');
      await click('.logged-user-name');

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.not.exist;
      });
    });

    describe('button rendering', function() {

      context('when the user is on compte page', function() {
        it('should not render a button link to the "profile" page', async function() {
          this.owner.register('service:-routing', Service.extend({
            currentRouteName: 'compte',
            generateURL: function() {
              return '/compte';
            }
          }));
          // when
          await render(hbs`{{user-logged-menu}}`);
          await click('.logged-user-name');

          return wait().then(() => {
            // then
            expect(findAll('.user-menu-item__account-link').length).to.equal(0);
          });
        });

        it('should not render a button link to the "board" page', async function() {
          this.owner.register('service:-routing', Service.extend({
            currentRouteName: 'board',
            generateURL: function() {
              return '/board';
            }
          }));

          // when
          await render(hbs`{{user-logged-menu}}`);
          await click('.logged-user-name');

          return wait().then(() => {
            // then
            expect(findAll('.user-menu-item__account-link').length).to.equal(0);
          });
        });
      });

      it('should render a button link to the profile when the user is not on compte page', async function() {
        this.owner.register('service:-routing', Service.extend({
          generateURL: function() {
            return '/autreRoute';
          }
        }));

        // when
        await render(hbs`{{user-logged-menu}}`);
        await click('.logged-user-name__link');

        return wait().then(() => {
          // then
          expect(find('.user-menu-item__details-account-link').textContent.trim()).to.equal('Mon compte');
          expect(findAll('.user-menu-item__details-account-link').length).to.equal(1);
        });
      });

    });

  });

  describe('when user is unlogged or not found', function() {
    beforeEach(function() {
      this.owner.register('service:currentUser', Service.extend({ user: null }));
    });

    it('should not display user information, for unlogged', async function() {
      // when
      await render(hbs`{{user-logged-menu}}`);

      // then
      return wait().then(() => {
        expect(find('.logged-user-name')).to.not.exist;
      });
    });
  });
});
