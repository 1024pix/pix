import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { clickByName, render, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | member-item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const user = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    this.membership = EmberObject.create({ id: 1, user, displayedOrganizationRole: 'Administrateur' });
  });

  test('it should display a member', async function (assert) {
    // when
    const screen = await render(hbs`<MemberItem @membership={{this.membership}} />`);

    // then
    assert.dom(screen.getByText('1')).exists();
    assert.dom(screen.getByText('Jojo')).exists();
    assert.dom(screen.getByText('La Gringue')).exists();
    assert.dom(screen.getByText('jojo@lagringue.fr')).exists();
    assert.dom(screen.getByText('Administrateur')).exists();
    assert.dom(screen.getByRole('button', { name: 'Modifier le rôle' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Désactiver' })).exists();
  });

  module("when editing organization's role", function () {
    test('it should display save and cancel button', async function (assert) {
      // given
      this.updateMembership = sinon.spy();

      // when
      const screen = await render(
        hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
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
        hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
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
        hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
      );
      await clickByName('Modifier le rôle');

      // when
      await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(this.membership.organizationRole, 'MEMBER');
      assert.ok(this.updateMembership.called);
    });

    test('it should not update role on cancel', async function (assert) {
      // given
      this.updateMembership = sinon.spy();
      const screen = await render(
        hbs`<MemberItem @membership={{this.membership}} @updateMembership={{this.updateMembership}} />`
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
        hbs`<MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`
      );

      // when
      await clickByName('Désactiver');

      // then
      assert.dom('.modal-dialog').exists();
      assert.dom(screen.getByText("Désactivation d'un membre")).exists();
      assert.dom(screen.getByText('Etes-vous sûr de vouloir désactiver ce membre de cette équipe ?')).exists();
    });

    test('should close confirm modal on click on cancel', async function (assert) {
      // given
      this.disableMembership = sinon.spy();
      await render(hbs`<MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`);
      await clickByName('Désactiver');

      // when
      await click('.modal-footer > button.btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });

    test('should disable membership on click on confirm', async function (assert) {
      // given
      this.disableMembership = sinon.spy();
      await render(hbs`<MemberItem @membership={{this.membership}} @disableMembership={{this.disableMembership}} />`);
      await clickByName('Désactiver');

      // when
      await click('.modal-footer > button.btn-primary');

      // then
      assert.ok(this.disableMembership.called);
    });
  });
});
