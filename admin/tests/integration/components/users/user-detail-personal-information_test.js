import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { clickByName, render } from '@1024pix/ember-testing-library';

module('Integration | Component | users | user-detail-personal-information', function (hooks) {
  setupRenderingTest(hooks);

  class AccessControlStub extends Service {
    hasAccessToUsersActionsScope = true;
  }

  module('schooling registrations', function () {
    module('When user has no schoolingRegistrations', function () {
      test('should display no result in schooling registrations table', async function (assert) {
        // given
        this.set('user', { schoolingRegistrations: [] });
        this.owner.register('service:access-control', AccessControlStub);

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
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.strictEqual(screen.getAllByLabelText('Inscription').length, 2);
      });

      module('Display the schooling registrations status', function () {
        test('Should display a green tick mark on the table when "isDisabled = false"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: false }] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByLabelText('Inscription activée')).exists();
        });

        test('Should display a red cross on the table when "isDisabled= true"', async function (assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1, isDisabled: true }] });
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom(screen.getByLabelText('Inscription désactivée')).exists();
        });
      });
    });
  });

  module('when the admin member click on anonymize button', function (hooks) {
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
      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await clickByName('Anonymiser cet utilisateur');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Merci de confirmer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
      assert
        .dom(screen.getByText('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.'))
        .exists();
    });

    test('should close the modal to cancel action', async function (assert) {
      // given
      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Anonymiser cet utilisateur');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    });
  });

  module('when the admin member click on dissociate button', function () {
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
      this.owner.register('service:access-control', AccessControlStub);

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
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Dissocier');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Confirmer la dissociation' })).doesNotExist();
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
      this.owner.register('service:access-control', AccessControlStub);

      await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);
      await clickByName('Dissocier');

      // when
      await clickByName('Oui, je dissocie');

      // then
      assert.ok(destroyRecordStub.called);
    });
  });

  module('when the admin member click on remove authentication method button', function () {
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
      this.owner.register('service:access-control', AccessControlStub);
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
      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByName('Supprimer');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Confirmer la suppression' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Oui, je supprime' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    });

    module('when the admin member confirm the removal', function () {
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
        this.owner.register('service:access-control', AccessControlStub);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        const screen = await render(
          hbs`<Users::UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await clickByName('Supprimer');

        // when
        await clickByName('Oui, je supprime');

        // then
        assert.ok(removeAuthenticationMethodStub.called);
        assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
      });

      test('should display an error message when the admin member try to remove the last authentication method', async function (assert) {
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
        this.owner.register('service:access-control', AccessControlStub);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        removeAuthenticationMethodStub.rejects({ errors: [{ status: '403' }] });

        const screen = await render(
          hbs`<Users::UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`
        );
        await clickByName('Supprimer');

        // when
        await clickByName('Oui, je supprime');

        // then
        sinon.assert.calledWith(
          notificationErrorStub,
          'Vous ne pouvez pas supprimer la dernière méthode de connexion de cet utilisateur'
        );
        assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
      });
    });
  });
});
