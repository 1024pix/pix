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

    test('should display user’s gar authentication method', async function (assert) {
      // given
      this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
      this.set('user', { hasGarAuthenticationMethod: true });

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

      module('When user does not have pix authentication method', function () {
        test('it should display add authentication method button', async function (assert) {
          // given
          this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
          this.set('user', {
            isAllowedToAddEmailAuthenticationMethod: true,
            hasOnlyOneAuthenticationMethod: true,
            hasPixAuthenticationMethod: false,
          });

          // when
          await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
            @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
          />`);

          // then
          assert.contains('Ajouter une adresse e-mail');
        });
      });

      module('When user has a pix authentication method', function () {
        test('it should not display add authentication method button', async function (assert) {
          // given
          this.set('toggleDisplayRemoveAuthenticationMethodModal', sinon.spy());
          this.set('user', { hasOnlyOneAuthenticationMethod: true, hasPixAuthenticationMethod: true });

          // when
          await render(hbs`
          <Users::UserDetailPersonalInformation::AuthenticationMethod
            @user={{this.user}}
            @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
          />`);

          // then
          assert.notContains('Ajouter une adresse e-mail');
        });
      });
    });
  });
});
