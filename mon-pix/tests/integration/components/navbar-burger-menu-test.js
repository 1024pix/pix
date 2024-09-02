import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | navbar-burger-menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    class currentUser extends Service {
      user = {
        fullName: 'Bobby Carotte',
      };
    }

    this.owner.register('service:currentUser', currentUser);
  });

  test("should display the user's fullname", async function (assert) {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

    // then
    assert.ok(screen.getByRole('heading', { name: 'Bobby Carotte' }));
  });

  test('should display the navigation menu with "Home", "Skills", "Certification", "My tutorials" and "I have a code" links', async function (assert) {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

    // then
    assert.ok(screen.getByRole('link', { name: t('navigation.main.code') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.dashboard') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.skills') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.start-certification') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.tutorials') }));
  });

  test('should display the user menu with "My account", "My certifications", "Help", "Log-out" links', async function (assert) {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

    // then
    assert.ok(screen.getByRole('link', { name: t('navigation.user.account') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.user.certifications') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.help') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.user.sign-out') }));
  });

  module('when user has participations', function (hooks) {
    hooks.beforeEach(async function () {
      class currentUser extends Service {
        user = {
          fullName: 'Bobby Carotte',
          hasAssessmentParticipations: true,
        };
      }

      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    test('should display "My tests" link', async function (assert) {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

      // then
      assert.ok(screen.getByRole('link', { name: t('navigation.user.tests') }));
    });
  });

  module('when user has no participations', function (hooks) {
    hooks.beforeEach(async function () {
      class currentUser extends Service {
        user = {
          fullName: 'John Doe',
          hasAssessmentParticipations: false,
        };
      }

      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    test('should not display "My tests" link', async function (assert) {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

      // then
      assert.notOk(screen.queryByRole('link', { name: t('navigation.user.tests') }));
    });
  });
  module('when user has recommended trainings', function (hooks) {
    hooks.beforeEach(async function () {
      class currentUser extends Service {
        user = {
          fullName: 'John Doe',
          hasRecommendedTrainings: true,
        };
      }

      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    test('should not display "My trainings" link', async function (assert) {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

      // then
      assert.notOk(screen.queryByRole('link', { name: t('navigation.user.trainings') }));
    });
  });
});
