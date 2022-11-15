import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | user logged menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when rendering for logged user', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      class currentUserService extends Service {
        user = {
          firstName: 'Hermione',
          email: 'hermione.granger@hogwarts.com',
          fullName: 'Hermione Granger',
        };
      }

      this.owner.register('service:currentUser', currentUserService);
    });

    test('should render component', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom('.logged-user-details').exists();
    });

    test('should display logged user name with a11y guidance', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      const nodes = find('.logged-user-name__link').childNodes;
      const buttonTextContent = nodes[1].textContent;
      const a11yText = nodes[3].textContent;

      assert.dom('.logged-user-name').exists();
      assert.dom('.logged-user-name__link').exists();
      assert.equal(a11yText, this.intl.t('navigation.user-logged-menu.details'));
      assert.equal(buttonTextContent, 'Hermione');
    });

    test('should hide user menu, when no action on user-name', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom('.logged-user-menu').doesNotExist();
    });

    test('should display a user menu, when user-name is clicked', async function (assert) {
      // given
      const MENU_ITEMS_COUNT = 4;

      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name__link');

      // then
      assert.dom('.logged-user-menu').exists();
      assert.dom('.logged-user-menu__link').exists({ count: MENU_ITEMS_COUNT });
      assert.ok(screen.getByText('Hermione Granger'));
    });

    test('should display link to user certifications', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');

      // then
      assert.ok(screen.getByRole('link', { name: 'Mes certifications' }));
    });

    test('should display link to help center', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');

      // then
      assert.ok(screen.getByRole('link', { name: 'Aide' }));
    });

    test('should hide user menu, when it was previously open and user-name is clicked one more time', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      // then
      assert.dom('.logged-user-menu').doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press key escape', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await triggerKeyEvent('.logged-user-name', 'keydown', 27);

      // then
      assert.dom('.logged-user-menu').doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press shift-tab key', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await triggerKeyEvent('.logged-user-name', 'keydown', 9, { shiftKey: true });

      // then
      assert.dom('.logged-user-menu').doesNotExist();
    });

    test('should hide user menu, when the menu is opened then closed', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);
      await click('.logged-user-name');
      await click('.logged-user-name');

      // then
      assert.dom('.logged-user-menu').doesNotExist();
    });

    module('Link to "My tests"', function () {
      module('when user has at least one participation', function (hooks) {
        hooks.beforeEach(function () {
          class currentUserService extends Service {
            user = {
              hasAssessmentParticipations: true,
            };
          }
          this.owner.unregister('service:currentUser');
          this.owner.register('service:currentUser', currentUserService);
        });

        test('should display link to user tests', async function (assert) {
          // when
          const screen = await render(hbs`<UserLoggedMenu/>`);
          await click('.logged-user-name');

          // then
          assert.ok(screen.getByRole('link', { name: 'Mes parcours' }));
        });
      });

      module('when user has no participation', function () {
        test('should not display link to user tests', async function (assert) {
          // when
          const screen = await render(hbs`<UserLoggedMenu/>`);
          await click('.logged-user-name');

          // then
          assert.notOk(screen.queryByRole('link', { name: 'Mes parcours' }));
        });
      });
    });
  });

  module('when user is unlogged or not found', function (hooks) {
    hooks.beforeEach(function () {
      class currentUserService extends Service {
        user = null;
      }
      this.owner.register('service:currentUser', currentUserService);
    });

    test('should not display user information, for unlogged', async function (assert) {
      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.dom('.logged-user-name').doesNotExist();
    });
  });
});
