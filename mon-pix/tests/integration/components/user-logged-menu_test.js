import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, triggerKeyEvent } from '@ember/test-helpers';
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
          fullName: 'Hermione Granger',
        };
      }

      this.owner.register('service:currentUser', currentUserService);
    });

    test('should display logged user name with a11y guidance', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);

      // then
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
      });
      const nodes = buttonMenu.childNodes;
      const buttonTextContent = nodes[1].textContent;
      const a11yText = nodes[3].textContent;

      assert.strictEqual(a11yText, this.intl.t('navigation.user-logged-menu.details'));
      assert.strictEqual(buttonTextContent, 'Hermione');
    });

    test('should hide user menu, when no action on user-name', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            expanded: false,
          })
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.account') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.certifications') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.main.help') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.sign-out') })).doesNotExist();
    });

    test('should display a user menu, when user-name is clicked', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
        })
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            expanded: true,
          })
        )
        .exists();
      assert.ok(screen.getByText('Hermione Granger'));
    });

    test('should display link to user certifications', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
        })
      );

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.user.certifications') }));
    });

    test('should display link to help center', async function (assert) {
      // when
      const screen = await render(hbs`<UserLoggedMenu/>`);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
        })
      );

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.main.help') }));
    });

    test('should hide user menu, when it was previously open and user-name is clicked one more time', async function (assert) {
      // given
      const screen = await render(hbs`<UserLoggedMenu/>`);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await click(buttonMenu);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            expanded: false,
          })
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.account') })).doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press key escape', async function (assert) {
      // given
      const screen = await render(hbs`<UserLoggedMenu/>`);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await triggerKeyEvent(buttonMenu, 'keydown', 27);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            expanded: false,
          })
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.account') })).doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press shift-tab key', async function (assert) {
      // given
      const screen = await render(hbs`<UserLoggedMenu/>`);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await triggerKeyEvent(buttonMenu, 'keydown', 9, { shiftKey: true });

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            expanded: false,
          })
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: this.intl.t('navigation.user.account') })).doesNotExist();
    });

    module('Link to "My tests"', function () {
      module('when user has at least one participation', function (hooks) {
        hooks.beforeEach(function () {
          class currentUserService extends Service {
            user = {
              firstName: 'Hermione',
              hasAssessmentParticipations: true,
            };
          }
          this.owner.unregister('service:currentUser');
          this.owner.register('service:currentUser', currentUserService);
        });

        test('should display link to user tests', async function (assert) {
          // when
          const screen = await render(hbs`<UserLoggedMenu/>`);
          await click(
            screen.getByRole('button', {
              name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            })
          );

          // then
          assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.user.tests') }));
        });
      });

      module('when user has no participation', function () {
        test('should not display link to user tests', async function (assert) {
          // when
          const screen = await render(hbs`<UserLoggedMenu/>`);
          await click(
            screen.getByRole('button', {
              name: `Hermione ${this.intl.t('navigation.user-logged-menu.details')}`,
            })
          );

          // then
          assert.notOk(screen.queryByRole('link', { name: this.intl.t('navigation.user.tests') }));
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
      const screen = await render(hbs`<UserLoggedMenu/>`);

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: this.intl.t('navigation.user-logged-menu.details'),
          })
        )
        .doesNotExist();
    });
  });
});
