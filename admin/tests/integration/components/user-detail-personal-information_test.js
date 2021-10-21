import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';

import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | user-detail-personal-information', function (hooks) {
  setupRenderingTest(hooks);

  module('schooling registrations', function () {
    module('When user has no schoolingRegistrations', function () {
      test('should display no result in schooling registrations table', async function (assert) {
        // given
        this.set('user', { schoolingRegistrations: [] });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.contains('Aucun résultat');
      });
    });

    module('When user has schoolingRegistrations', function () {
      test('should display schooling registrations in table', async function (assert) {
        // given
        this.set('user', { schoolingRegistrations: [{ id: 1 }, { id: 2 }] });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('tr[aria-label="Inscription"]').exists({ count: 2 });
      });

      module('Display the schooling registrations status', function () {
        test('Should display a green tick mark on the table when "isDisabled = false"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: false }] });

          // when
          await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('[aria-label="Inscription activée"]').exists();
        });

        test('Should display a red cross on the table when "isDisabled= true"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: true }] });

          // when
          await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('[aria-label="Inscription désactivée"]').exists();
        });
      });
    });
  });

  module('authentication methods', function () {
    module('When user has authentication methods', function () {
      test('should display user’s email authentication method', async function (assert) {
        // given
        this.set('user', { hasEmailAuthenticationMethod: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('div[data-test-email] > div > svg').hasClass('user-authentication-method-item__check');
      });

      test('should display user’s username authentication method', async function (assert) {
        // given
        this.set('user', { hasUsernameAuthenticationMethod: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('div[data-test-username] > div > svg').hasClass('user-authentication-method-item__check');
      });

      test('should display user’s Pole Emploi authentication method', async function (assert) {
        // given
        this.set('user', { hasPoleEmploiAuthenticationMethod: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('div[data-test-pole-emploi] > div > svg').hasClass('user-authentication-method-item__check');
      });

      test('should display user’s GAR authentication method', async function (assert) {
        // given
        this.set('user', { hasGARAuthenticationMethod: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('div[data-test-mediacentre] > div > svg').hasClass('user-authentication-method-item__check');
      });

      module('When user has only one authentication method', function () {
        test('it should not display a remove authentication method link', async function (assert) {
          // given
          this.set('user', { hasOnlyOneAuthenticationMethod: true });

          // when
          await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.notOk(find('.user-authentication-method__remove-button'));
        });
      });
    });
  });

  module('when the administrator click on anonymize button', function (hooks) {
    let user = null;

    hooks.beforeEach(function () {
      user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: null,
      });
    });

    test('should show modal', async function (assert) {
      // given
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await clickByLabel('Anonymiser cet utilisateur');

      // then
      assert.dom('.modal-dialog').exists();
      assert.contains('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.');
    });

    test('should close the modal to cancel action', async function (assert) {
      // given
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByLabel('Anonymiser cet utilisateur');

      // when
      await click('.modal-dialog .btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });
  });

  module('when the administrator click on dissociate button', function () {
    test('should display dissociate confirm modal', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}} />`);

      // when
      await click('button[data-test-dissociate-schooling-registration]');

      // then
      assert.contains('Confirmer la dissociation');
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await click('button[data-test-dissociate-schooling-registration]');

      // when
      await clickByLabel('Annuler');

      // then
      assert.notContains('Confirmer la dissociation');
      assert.notOk(destroyRecordStub.called);
    });

    test('should call destroyRecord on click on confirm button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}} />`);
      await click('button[data-test-dissociate-schooling-registration]');

      // when
      await clickByLabel('Oui, je dissocie');

      // then
      assert.ok(destroyRecordStub.called);
    });
  });

  module('when the administrator click on remove authentication method button', function () {
    test('should display remove authentication methode confirm modal', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        hasEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await click('button[data-test-remove-email]');

      // then
      assert.contains('Confirmer la suppression');
    });

    // eslint-disable-next-line mocha/no-identical-title
    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        hasEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await click('button[data-test-remove-email]');

      // when
      await click('.modal-dialog .btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });

    module('when the administrator confirm the removal', function () {
      test('should call removeAuthenticationMethod parameter', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: 'john.harry.1010',
          hasEmailAuthenticationMethod: true,
        });
        this.set('user', user);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        await render(
          hbs`<UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await click('button[data-test-remove-email]');

        // when
        await click('.modal-dialog .btn-primary');

        // then
        assert.ok(removeAuthenticationMethodStub.called);
        assert.dom('.modal-dialog').doesNotExist();
      });

      test('should display an error message when the administrator try to remove the last authentication method', async function (assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          hasEmailAuthenticationMethod: true,
        });
        this.set('user', user);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        removeAuthenticationMethodStub.rejects({ errors: [{ status: '403' }] });

        await render(
          hbs`<UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await click('button[data-test-remove-email]');

        // when
        await click('.modal-dialog .btn-primary');

        // then
        sinon.assert.calledWith(
          notificationErrorStub,
          'Vous ne pouvez pas supprimer la dernière méthode de connexion de cet utilisateur'
        );
        assert.dom('.modal-dialog').doesNotExist();
      });
    });
  });
});
