import { module, test } from 'qunit';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import { fillByLabel, clickByText, render, clickByName } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::MembersListItem', function (hooks) {
  setupIntlRenderingTest(hooks);
  let adminMembership;
  let memberMembership;

  hooks.beforeEach(function () {
    adminMembership = {
      id: 1,
      displayRole: 'Administrateur',
      organizationRole: 'ADMIN',
      user: {
        id: 111,
        firstName: 'Gigi',
        lastName: 'La Terreur',
      },
      save: sinon.stub(),
    };

    memberMembership = {
      id: 1,
      displayRole: 'Membre',
      organizationRole: 'MEMBER',
      user: {
        id: 111,
        firstName: 'Jojo',
        lastName: 'La Panique',
      },
      save: sinon.stub(),
    };
  });

  test('it should display an administrator firstName, lastName, role and edit button', async function (assert) {
    // given
    this.set('membership', adminMembership);

    // when
    await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('Administrateur');
    assert.dom('button[aria-label="Gérer"]').exists;
  });

  module('When edit organization role button is clicked', function () {
    test('it should show update and save button, and show the drop down to select role to update', async function (assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

      // when
      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // then
      assert.dom('.zone-save-cancel-role').exists({ count: 1 });
      assert.dom('#save-organization-role').exists({ count: 1 });
      assert.dom('#cancel-update-organization-role').exists({ count: 1 });
    });

    test('it should cancel the update if using the cancel button', async function (assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // when
      await clickByName('Annuler');

      // then
      assert.equal(memberMembership.organizationRole, 'MEMBER');
      sinon.assert.notCalled(memberMembership.save);
    });

    test('it should change the value of the drop down to Administrateur and display the modified role', async function (assert) {
      // given
      this.set('membership', memberMembership);

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // when
      await fillByLabel('Sélectionner un rôle', 'ADMIN');
      await clickByText('Enregistrer');

      // then
      assert.equal(memberMembership.organizationRole, 'ADMIN');
      sinon.assert.called(memberMembership.save);
    });

    test('it should change the value of the drop down to Membre and display the modified role', async function (assert) {
      // given
      this.set('membership', adminMembership);

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // when
      await fillByLabel('Sélectionner un rôle', 'MEMBER');
      await clickByText('Enregistrer');

      // then
      assert.equal(adminMembership.organizationRole, 'MEMBER');
      sinon.assert.called(adminMembership.save);
    });

    test('it should display success message when updating a member role', async function (assert) {
      // given
      const notifications = this.owner.lookup('service:notifications');
      sinon.stub(notifications, 'success');
      this.set('membership', adminMembership);

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // when
      await fillByLabel('Sélectionner un rôle', 'MEMBER');
      await clickByText('Enregistrer');

      // then
      sinon.assert.calledWith(
        notifications.success,
        this.intl.t('pages.team-members.notifications.change-member-role.success')
      );
      assert.ok(true);
    });

    test('it should display error message when updating a member role fails', async function (assert) {
      // given
      adminMembership.save.rejects();
      this.set('membership', adminMembership);
      const notifications = this.owner.lookup('service:notifications');
      sinon.stub(notifications, 'error');

      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
      await clickByName('Gérer');
      await clickByText('Modifier le rôle');

      // when
      await fillByLabel('Sélectionner un rôle', 'MEMBER');
      await clickByText('Enregistrer');

      // then
      sinon.assert.calledWith(
        notifications.error,
        this.intl.t('pages.team-members.notifications.change-member-role.error')
      );
      assert.ok(true);
    });
  });

  module('When remove member button is clicked', (hooks) => {
    let removeMembershipStub;

    hooks.beforeEach(async function () {
      // given
      removeMembershipStub = sinon.stub();
      memberMembership.user.get = (attr) => {
        return attr === 'firstName' ? memberMembership.user.firstName : memberMembership.user.lastName;
      };
      this.set('membership', memberMembership);
      this.set('removeMembership', removeMembershipStub);

      // when
      await render(hbs`<Team::MembersListItem @membership={{membership}} @onRemoveMember={{removeMembership}} />`);
      await clickByName('Gérer');
      await clickByText('Supprimer');
    });

    test('should display a confirmation modal', function (assert) {
      // then
      assert.contains('Confirmez-vous la suppression ?');
      assert.contains('Annuler');
      assert.contains('Supprimer');
    });

    test('should display the membership first name and last name in the modal', function (assert) {
      // then
      assert.contains(memberMembership.user.firstName);
      assert.contains(memberMembership.user.lastName);
    });

    test('should close the modal by clicking on cancel button', async function (assert) {
      // when
      await clickByName('Annuler');

      // then
      assert.notContains("Supprimer de l'équipe");
    });

    test('should call removeMembership and close modal by clicking on remove button', async function (assert) {
      // when
      await clickByText('Oui, supprimer le membre');

      // then
      sinon.assert.calledWith(removeMembershipStub, memberMembership);
      assert.notContains("Supprimer de l'équipe");
    });
  });
});
