import { render } from '@1024pix/ember-testing-library';
import { click, settled, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UserLoggedMenu from 'mon-pix/components/user-logged-menu';
import { module, test } from 'qunit';

import { stubCurrentUserService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | user logged menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when rendering for logged user', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      stubCurrentUserService(this.owner, { firstName: 'Hermione', lastName: 'Granger' });
    });

    test('should display logged user name with a11y guidance', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
          }),
        )
        .exists();
    });

    test('should hide user menu, when no action on user-name', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: false,
          }),
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.account') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.certifications') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: t('navigation.main.help') })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.sign-out') })).doesNotExist();
    });

    test('should display a user menu, when user-name is clicked', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${t('navigation.user-logged-menu.details')}`,
        }),
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: true,
          }),
        )
        .exists();
      assert.ok(screen.getByText('Hermione Granger'));
    });

    test('should display link to user certifications', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${t('navigation.user-logged-menu.details')}`,
        }),
      );

      // then
      assert.ok(screen.getByRole('link', { name: t('navigation.user.certifications') }));
    });

    test('should display link to help center', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);
      await click(
        screen.getByRole('button', {
          name: `Hermione ${t('navigation.user-logged-menu.details')}`,
        }),
      );

      // then
      assert.ok(screen.getByRole('link', { name: t('navigation.main.help') }));
    });

    test('should hide user menu, when it was previously open and user-name is clicked one more time', async function (assert) {
      // given
      const screen = await render(<template><UserLoggedMenu /></template>);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await click(buttonMenu);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: false,
          }),
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.account') })).doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press key escape', async function (assert) {
      // given
      const screen = await render(<template><UserLoggedMenu /></template>);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await triggerKeyEvent(buttonMenu, 'keydown', 27);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: false,
          }),
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.account') })).doesNotExist();
    });

    test('should hide user menu, when it was previously open and user press shift-tab key', async function (assert) {
      // given
      const screen = await render(<template><UserLoggedMenu /></template>);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${t('navigation.user-logged-menu.details')}`,
      });

      // when
      await click(buttonMenu);
      await triggerKeyEvent(buttonMenu, 'keydown', 9, { shiftKey: true });

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: false,
          }),
        )
        .exists();
      assert.dom(screen.queryByRole('link', { name: t('navigation.user.account') })).doesNotExist();
    });

    test('should hide user menu when a link is clicked with a pointer device', async function (assert) {
      // given
      const screen = await render(<template><UserLoggedMenu /></template>);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${t('navigation.user-logged-menu.details')}`,
      });
      await click(buttonMenu);

      // when
      const link = screen.getByRole('link', { name: t('navigation.main.help') });
      link.dispatchEvent(new PointerEvent('click', { bubbles: true, pointerType: 'mouse' }));
      await settled();

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: false,
          }),
        )
        .exists();
    });

    test('should keep user menu open when a link is activated with the keyboard', async function (assert) {
      // given
      const screen = await render(<template><UserLoggedMenu /></template>);
      const buttonMenu = screen.getByRole('button', {
        name: `Hermione ${t('navigation.user-logged-menu.details')}`,
      });
      await click(buttonMenu);

      // when
      await triggerEvent(screen.getByRole('link', { name: t('navigation.main.help') }), 'click', { detail: 0 });

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            expanded: true,
          }),
        )
        .exists();
    });

    module('Link to "My tests"', function () {
      module('when user has at least one participation', function (hooks) {
        hooks.beforeEach(function () {
          stubCurrentUserService(this.owner, {
            id: '456',
            firstName: 'Hermione',
            lastName: 'Granger',
            hasAssessmentParticipations: true,
          });
        });

        test('should display link to user tests', async function (assert) {
          // when
          const screen = await render(<template><UserLoggedMenu /></template>);
          await click(
            screen.getByRole('button', {
              name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            }),
          );

          // then
          assert.ok(screen.getByRole('link', { name: t('navigation.user.tests') }));
        });
      });

      module('when user has no participation', function () {
        test('should not display link to user tests', async function (assert) {
          // when
          const screen = await render(<template><UserLoggedMenu /></template>);
          await click(
            screen.getByRole('button', {
              name: `Hermione ${t('navigation.user-logged-menu.details')}`,
            }),
          );

          // then
          assert.notOk(screen.queryByRole('link', { name: t('navigation.user.tests') }));
        });
      });
    });
  });

  module('when user is unlogged or not found', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { isAuthenticated: false });
    });

    test('should not display user information, for unlogged', async function (assert) {
      // when
      const screen = await render(<template><UserLoggedMenu /></template>);

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('navigation.user-logged-menu.details'),
          }),
        )
        .doesNotExist();
    });
  });
});
