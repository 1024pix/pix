import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | users | user-detail-personal-information/authentication-method', function (hooks) {
  setupRenderingTest(hooks);

  module('When user has authentication methods', function () {
    test('should display user’s email authentication method', async function (assert) {
      // given
      this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
      this.set('user', { hasEmailAuthenticationMethod: true });

      // when
      await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
          @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        />`);

      // then
      assert.dom('tr[data-test-email] svg').hasClass('authentication-method__check');
    });

    test('should display user’s username authentication method', async function (assert) {
      // given
      this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
      this.set('user', { hasUsernameAuthenticationMethod: true });

      // when
      await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
          @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        />`);

      // then
      assert.dom('tr[data-test-username] svg').hasClass('authentication-method__check');
    });

    test('should display user’s Pole Emploi authentication method', async function (assert) {
      // given
      this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
      this.set('user', { hasPoleEmploiAuthenticationMethod: true });

      // when
      await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
          @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        />`);

      // then
      assert.dom('tr[data-test-pole-emploi] svg').hasClass('authentication-method__check');
    });

    test('should display user’s GAR authentication method', async function (assert) {
      // given
      this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
      this.set('user', { hasGARAuthenticationMethod: true });

      // when
      await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
          @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        />`);

      // then
      assert.dom('tr[data-test-gar] svg').hasClass('authentication-method__check');
    });

    module('When user has only one authentication method', function () {
      test('it should not display a remove authentication method link', async function (assert) {
        // given
        this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
        this.set('user', { hasOnlyOneAuthenticationMethod: true });

        // when
        await render(hbs`
        <Users::UserDetailPersonalInformation::AuthenticationMethod
          @user={{this.user}}
          @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        />`);

        // then
        assert.notOk(find('.user-authentication-method__remove-button'));
      });
    });
  });
});
