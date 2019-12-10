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
      expect(find('.logged-user-name__link').textContent.trim()).to.be.equal('FHI');
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
        expect(find('.logged-user-menu-details__fullName').textContent.trim()).to.equal('FHI 4EVER');
        expect(find('.logged-user-menu-details__email').textContent.trim()).to.equal('FHI@4EVER.fr');
      });
    });

    it('should display link to user certifications', async function() {
      // when
      await render(hbs`{{user-logged-menu _canDisplayMenu=true}}`);

      return wait().then(() => {
        // then
        expect(find('.logged-user-menu')).to.exist;
        expect(findAll('.logged-user-menu__link')).to.have.lengthOf(2);
        expect(findAll('.logged-user-menu__link')[0].textContent.trim()).to.equal('Mes certifications');
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
