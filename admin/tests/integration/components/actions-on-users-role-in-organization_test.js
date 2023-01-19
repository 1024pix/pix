import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render, clickByName } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | actions-on-users-role-in-organization', function (hooks) {
  setupRenderingTest(hooks);

  module('when user has access to organization actions scope', function () {
    test('it should be possible to modify user role', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const store = this.owner.lookup('service:store');
      const organizationMembership = store.createRecord('organizationMembership', {
        role: 'ADMIN',
        save: sinon.stub(),
      });
      this.set('organizationMembership', organizationMembership);

      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(
        hbs`<ActionsOnUsersRoleInOrganization @organizationMembership={{this.organizationMembership}} />`
      );
      await clickByName('Modifier le rôle');

      await click(screen.getByRole('button', { name: 'Sélectionner un rôle' }));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Membre' }));
      await clickByName('Enregistrer');

      // then
      assert.ok(organizationMembership.save.called);
      sinon.assert.calledWith(notificationSuccessStub, 'Le rôle du membre a été mis à jour avec succès.');
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).exists();
      assert.dom(screen.getByText('Membre')).exists();
    });

    test('it should be possible to disable user in a specific organization', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const store = this.owner.lookup('service:store');

      const organizationMembership = store.createRecord('organizationMembership', {
        role: 'ADMIN',
        reload: sinon.stub(),
      });

      sinon.stub(organizationMembership, 'save').resolves();

      this.set('organizationMembership', organizationMembership);

      const notificationSuccessStub = sinon.stub();
      class NotificationsStub extends Service {
        success = notificationSuccessStub;
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      const screen = await render(
        hbs`<ActionsOnUsersRoleInOrganization @organizationMembership={{this.organizationMembership}} />`
      );

      await clickByName("Désactiver l'agent");

      await screen.findByRole('dialog');

      await clickByName('Confirmer');

      // then
      sinon.assert.calledWith(notificationSuccessStub, 'Le membre a été désactivé avec succès.');
      assert.ok(organizationMembership.save.calledWith({ adapterOptions: { disable: true } }));
    });
  });

  module('when user has not access to organization actions scope', function () {
    test('it should not show actions buttons', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(
        hbs`<ActionsOnUsersRoleInOrganization @organizationMembership={{this.organizationMembership}} />`
      );

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Désactiver' })).doesNotExist();
    });
  });
});
