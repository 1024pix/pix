import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | user-detail-personal-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  class AccessControlStub extends Service {
    hasAccessToUsersActionsScope = true;
  }

  module('when the admin member click on dissociate button', function () {
    test('should display dissociate confirm modal', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
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
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);

      // when
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByText('Confirmer la dissociation')).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
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
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      // TODO Add Aria-hidden to PixUI before fix this test
      //assert.dom(screen.queryByRole('heading', { name: 'Confirmer la dissociation' })).doesNotExist();
      assert.ok(destroyRecordStub.notCalled);
    });

    test('should call destroyRecord on click on confirm button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
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
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Oui, je dissocie' }));

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
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
      });

      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);

      // when
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Confirmer la suppression' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Oui, je supprime' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByText('Suppression de la méthode de connexion suivante : Adresse e-mail')).exists();
    });

    // TODO Add Aria-hidden to PixUI before fix this test
    test.skip('should close the modal on click on cancel button', async function (assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
      });

      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Annuler' }));

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
          authenticationMethods: [{ identityProvider: 'PIX' }, { identityProvider: 'POLE_EMPLOI' }],
        });
        this.set('user', user);
        this.owner.register('service:access-control', AccessControlStub);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        const screen = await render(
          hbs`<Users::UserDetailPersonalInformation
  @user={{this.user}}
  @removeAuthenticationMethod={{this.removeAuthenticationMethod}}
/>`,
        );
        await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

        await screen.findByRole('dialog');

        // when
        await click(screen.getByRole('button', { name: 'Oui, je supprime' }));

        // then
        assert.ok(removeAuthenticationMethodStub.called);
      });
    });
  });

  module('when there is only one authentication method', function () {
    test('it should not be possible de remove the last authentication method', async function (assert) {
      // given
      class OidcIdentityProvidersStub extends Service {
        get list() {
          return [
            {
              code: 'SUNLIGHT_NAVIGATIONS',
              organizationName: 'Sunlight Navigations',
            },
          ];
        }
      }

      const user = EmberObject.create({
        lastName: 'Pix',
        firstName: 'Aile',
        email: 'pix.aile@gmail.com',
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });

      this.set('user', user);
      this.owner.register('service:access-control', AccessControlStub);
      this.owner.register('service:oidc-identity-providers', OidcIdentityProvidersStub);
      const screen = await render(hbs`<Users::UserDetailPersonalInformation @user={{this.user}} />`);

      // when & then
      assert.dom(screen.getByLabelText("L'utilisateur a une méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Sunlight Navigations")).exists();
      assert.dom(screen.queryByRole('button', { name: 'Supprimer' })).doesNotExist();
    });
  });
});
