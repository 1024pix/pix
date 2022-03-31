import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { clickByName, render } from '@1024pix/ember-testing-library';

module('Integration | Component | users | user-detail-personal-information', function (hooks) {
  setupRenderingTest(hooks);

  module('schooling registrations', function () {
    module('When user has no schoolingRegistrations', function () {
      test('should display no result in schooling registrations table', async function (assert) {
        // given
        this.set('user', { schoolingRegistrations: [] });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom(screen.getByText('Aucun résultat')).exists();
      });
    });

    module('When user has schoolingRegistrations', function () {
      test('should display schooling registrations in table', async function (assert) {
        // given
        this.set('user', { schoolingRegistrations: [{ id: 1 }, { id: 2 }] });

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.strictEqual(screen.getAllByLabelText('Inscription').length, 2);
      });

      module('Display the schooling registrations status', function () {
        test('Should display a green tick mark on the table when "isDisabled = false"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: false }] });

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByLabelText('Inscription activée')).exists();
        });

        test('Should display a red cross on the table when "isDisabled= true"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: true }] });

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByLabelText('Inscription désactivée')).exists();
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
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await clickByName('Anonymiser cet utilisateur');

      // then
      assert.dom('.modal-dialog').exists();
      assert
        .dom(screen.getByText('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.'))
        .exists();
    });

    test('should close the modal to cancel action', async function (assert) {
      // given
      this.set('user', user);
      await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Anonymiser cet utilisateur');

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
        canBeDissociated: true,
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

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);

      // when
      await clickByName('Dissocier');

      // then
      assert.dom(screen.getByText('Confirmer la dissociation')).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
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

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Dissocier');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByText('Confirmer la dissociation')).doesNotExist();
      assert.notOk(destroyRecordStub.called);
    });

    test('should call destroyRecord on click on confirm button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
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

      await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);
      await clickByName('Dissocier');

      // when
      await clickByName('Oui, je dissocie');

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
        hasPoleEmploiAuthenticationMethod: true,
        isAllowedToRemoveEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await clickByName('Supprimer');

      // then
      assert.dom(screen.getByText('Confirmer la suppression')).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        hasEmailAuthenticationMethod: true,
        hasPoleEmploiAuthenticationMethod: true,
        isAllowedToRemoveEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Supprimer');

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
          hasPoleEmploiAuthenticationMethod: true,
          isAllowedToRemoveEmailAuthenticationMethod: true,
        });
        this.set('user', user);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        await render(
          hbs`<Users::UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await clickByName('Supprimer');

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
          hasPoleEmploiAuthenticationMethod: true,
          isAllowedToRemoveEmailAuthenticationMethod: true,
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
          hbs`<Users::UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await clickByName('Supprimer');

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
