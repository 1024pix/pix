import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import {
  click,
  find,
  findAll,
  render,
  triggerKeyEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user logged menu', function() {

  setupIntlRenderingTest();

  describe('when rendering for logged user', function() {

    beforeEach(async function() {
      // given
      class currentUserService extends Service {
        user = {
          firstName: 'Hermione',
          email: 'hermione.granger@hogwarts.com',
          fullName: 'Hermione Granger',
        }
      }

      this.owner.register('service:currentUser', currentUserService);
    });

    it('should render component', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      expect(find('.logged-user-details')).to.exist;
    });

    it('should display logged user name with a11y guidance', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      const nodes = find('.logged-user-name__link').childNodes;
      const buttonTextContent = nodes[1].textContent;
      const a11yText = nodes[3].textContent;

      expect(find('.logged-user-name')).to.exist;
      expect(find('.logged-user-name__link')).to.exist;
      expect(a11yText).to.equal(this.intl.t('navigation.user-logged-menu.details'));
      expect(buttonTextContent).to.equal('Hermione');
    });

    it('should hide user menu, when no action on user-name', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });

    it('should display a user menu, when user-name is clicked', async function() {
      // given
      const MENU_ITEMS_COUNT = 4;

      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name__link');

      // then
      expect(find('.logged-user-menu')).to.exist;
      expect(findAll('.logged-user-menu__link')).to.have.lengthOf(MENU_ITEMS_COUNT);
      expect(find('.logged-user-menu-details__fullname').textContent.trim()).to.equal('Hermione Granger');
      expect(find('.logged-user-menu-details__identifier').textContent.trim()).to.equal('hermione.granger@hogwarts.com');
    });

    it('should display link to user certifications', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');

      // then
      expect(findAll('.logged-user-menu__link')[1].textContent.trim()).to.equal('Mes certifications');
    });

    it('should display link to help center', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');

      // then
      expect(findAll('.logged-user-menu__link')[2].textContent.trim()).to.equal('Aide');
    });

    it('should hide user menu, when it was previously open and user-name is clicked one more time', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });

    it('should hide user menu, when it was previously open and user press key escape', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await triggerKeyEvent('.logged-user-name', 'keydown', 27);

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });

    it('should hide user menu, when the menu is opened then closed', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      // then
      expect(find('.logged-user-menu')).to.not.exist;
    });
  });

  describe('when user is unlogged or not found', function() {
    beforeEach(function() {
      class currentUserService extends Service { user = null }
      this.owner.register('service:currentUser', currentUserService);
    });

    it('should not display user information, for unlogged', async function() {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      expect(find('.logged-user-name')).to.not.exist;
    });
  });
});
