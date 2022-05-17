import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, render, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | member-item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const user = EmberObject.create({ id: 123, firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });

    this.membership = EmberObject.create({ id: 1, user, displayedOrganizationRole: 'Administrateur' });

    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  test('it should display a member', async function (assert) {
    // when
    const screen = await render(hbs`<Organizations::MemberItem @membership={{this.membership}} />`);

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('Jojo')).exists();
    assert.dom(screen.getByText('La Gringue')).exists();
    assert.dom(screen.getByText('jojo@lagringue.fr')).exists();
    assert.dom(screen.getByText('Administrateur')).exists();
    assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Désactiver le membre' })).exists();
  });

  module("when editing organization's role", function () {
    test('it should display save and cancel button', async function (assert) {
      // given
      this.updateMembership = sinon.spy();

      // when
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
      );
      await clickByName('Modifier le rôle');

      // then
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByLabelText('Annuler')).exists();
    });

    test('it should display the options when select is open', async function (assert) {
      // given
      this.updateMembership = sinon.spy();
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
      );

      // when
      await clickByName('Modifier le rôle');

      // then
      assert.dom(screen.getByText('Membre')).exists();
      assert.dom(screen.getByText('Administrateur')).exists();
    });

    test('it should update role on save', async function (assert) {
      // given
      this.updateMembership = sinon.spy();
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
      );
      await clickByName('Modifier le rôle');

      // when
      await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.strictEqual(this.membership.organizationRole, 'MEMBER');
      assert.ok(this.updateMembership.called);
    });

    test('it should not update role on cancel', async function (assert) {
      // given
      this.updateMembership = sinon.spy();
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
      );
      await clickByName('Modifier le rôle');

      // when
      await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
      await clickByName('Annuler');

      // then
      assert.dom(screen.getByText('Administrateur')).exists();
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.notOk(this.updateMembership.called);
    });
  });

  module('when deactivating membership', function () {
    test('should open confirm modal', async function (assert) {
      // given
      this.disableMembership = sinon.spy();
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`
      );

      // when
      await clickByName('Désactiver le membre');

      // then
      assert.dom(screen.getByRole('heading', { name: "Désactivation d'un membre" })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByText('Etes-vous sûr de vouloir désactiver ce membre de cette équipe ?')).exists();
    });

    test('should close confirm modal on click on cancel', async function (assert) {
      // given
      this.disableMembership = sinon.spy();
      const screen = await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`
      );
      await clickByName('Désactiver le membre');

      // when
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByRole('heading', { name: "Désactivation d'un membre" })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    });

    test('should disable membership on click on confirm', async function (assert) {
      // given
      this.disableMembership = sinon.spy();
      await render(
        hbs`<Organizations::MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`
      );

      await clickByName('Désactiver le membre');

      // when
      await clickByName('Confirmer');

      // then
      assert.ok(this.disableMembership.called);
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to edit or deactivate a member', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      const screen = await render(hbs`<Organizations::MemberItem @membership={{this.membership}} />`);

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Modifier le rôle' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Désactiver' })).doesNotExist();
    });
  });
});
