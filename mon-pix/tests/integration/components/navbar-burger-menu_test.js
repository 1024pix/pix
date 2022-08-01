import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';

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
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    assert.dom(contains('Bobby Carotte')).exists();
  });

  test('should display the closing button', async function (assert) {
    // when
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    assert.dom(find('.navbar-burger-menu-navigation-header__close')).exists();
  });

  test('should display the navigation menu with "Home", "Skills", "Certification", "My tutorials" and "I have a code" links', async function (assert) {
    // when
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    assert.dom(find('.navbar-burger-menu__navigation')).exists();

    assert.equal(findAll('.navbar-burger-menu-navigation__item').length, 5);
    assert.dom(contains(this.intl.t('navigation.main.dashboard'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.skills'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.start-certification'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.tutorials'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.code'))).exists();
  });

  test('should display the user menu with "My account", "My certifications", "Help", "Log-out" links', async function (assert) {
    // when
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    assert.dom(find('.navbar-burger-menu__user-info')).exists();

    assert.dom(contains(this.intl.t('navigation.user.account'))).exists();
    assert.dom(contains(this.intl.t('navigation.user.certifications'))).exists();
    assert.dom(contains(this.intl.t('navigation.main.help'))).exists();
    assert.dom(contains(this.intl.t('navigation.user.sign-out'))).exists();
  });

  module('when user has participations', function (hooks) {
    hooks.beforeEach(async function () {
      class currentUser extends Service {
        user = {
          hasAssessmentParticipations: true,
        };
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    test('should display "My tests" link', async function (assert) {
      // when
      await render(hbs`<NavbarBurgerMenu />`);

      // then
      assert.dom(contains(this.intl.t('navigation.user.tests'))).exists();
    });
  });

  module('when user has no participations', function () {
    hooks.beforeEach(async function () {
      class currentUser extends Service {
        user = {
          hasAssessmentParticipations: false,
        };
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    test('should not display "My tests" link', async function (assert) {
      // when
      await render(hbs`<NavbarBurgerMenu />`);

      // then
      assert.dom(contains(this.intl.t('navigation.user.tests'))).doesNotExist();
    });
  });
});
