/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import {
  click,
  find,
  findAll,
  render,
  settled,
  triggerKeyEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user logged menu', function() {

  setupIntlRenderingTest();

  describe('when rendering for logged user', function() {

    beforeEach(async function() {
      // given
      this.owner.register('service:currentUser', Service.extend({
        user: {
          firstName: 'Hermione',
          email: 'hermione.granger@hogwarts.com',
          fullName: 'Hermione Granger',
        },
      }));

      // when
      await render(hbs`{{user-logged-menu}}`);
    });

    it('should render component', function() {
      // then
      expect(find('.logged-user-details')).to.exist;
    });

    it('should display logged user name with a11y guidance', function() {
      const nodes = find('.logged-user-name__link').childNodes;
      const buttonTextContent = nodes[1].textContent;
      const a11yText = nodes[3].textContent;

      // then
      expect(find('.logged-user-name')).to.exist;
      expect(find('.logged-user-name__link')).to.exist;
      expect(a11yText).to.equal(this.intl.t('navigation.user-logged-menu.details'));
      expect(buttonTextContent).to.equal('Hermione');
    });

    it('should hide user menu, when no action on user-name', async function() {
      // when
      await render(hbs`{{user-logged-menu}}`);

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });

    it('should display a user menu, when user-name is clicked', async function() {
      // given
      const MENU_ITEMS_COUNT = 3;
      await render(hbs`{{user-logged-menu}}`);

      // when
      await click('.logged-user-name__link');

      return settled().then(() => {
        // then
        expect(find('.logged-user-menu')).to.exist;
        expect(findAll('.logged-user-menu__link')).to.have.lengthOf(MENU_ITEMS_COUNT);
        expect(find('.logged-user-menu-details__fullname').textContent.trim()).to.equal('Hermione Granger');
        expect(find('.logged-user-menu-details__identifier').textContent.trim()).to.equal('hermione.granger@hogwarts.com');
      });
    });

    it('should display link to user certifications', async function() {
      // when
      await render(hbs`{{user-logged-menu _canDisplayMenu=true}}`);

      return settled().then(() => {
        // then
        expect(findAll('.logged-user-menu__link')[1].textContent.trim()).to.equal('Mes certifications');
      });
    });

    it('should hide user menu, when it was previously open and user-name is clicked one more time', async function() {
      // when
      await render(hbs`{{user-logged-menu}}`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      return settled().then(() => {
        // then
        expect(find('.logged-user-menu')).to.not.exist;
      });
    });

    it('should hide user menu, when it was previously open and user press key escape', async function() {
      // when
      await click('.logged-user-name');
      await triggerKeyEvent('.logged-user-name', 'keydown', 27);

      return settled().then(() => {
        // then
        expect(find('.logged-user-menu')).to.not.exist;
      });
    });

    it('should hide user menu, when the menu is opened then closed', async function() {
      // when
      await click('.logged-user-name');
      await click('.logged-user-name');

      return settled().then(() => {
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
      return settled().then(() => {
        expect(find('.logged-user-name')).to.not.exist;
      });
    });
  });
});
