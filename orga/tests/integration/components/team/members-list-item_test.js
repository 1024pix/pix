import { module, test } from 'qunit';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import { clickByText, render, clickByName, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';

class CurrentUserAdminStub extends Service {
  isAdminInOrganization = true;
  prescriber = {
    id: 344535,
  };
  organization = {
    credit: 10000,
  };
}

class CurrentUserMemberStub extends Service {
  isAdminInOrganization = false;
  organization = {
    credit: 10000,
  };
}

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
        get: sinon.stub().returns(111),
      },
      save: sinon.stub(),
    };

    memberMembership = {
      id: 2,
      displayRole: 'Membre',
      organizationRole: 'MEMBER',
      user: {
        id: 112,
        firstName: 'Jojo',
        lastName: 'La Panique',
        get: sinon.stub().returns(112),
      },
      save: sinon.stub(),
    };
  });

  module('when user is a member', function () {
    test('it should display a member, firstName, lastName and role', async function (assert) {
      // given
      this.set('membership', memberMembership);
      this.owner.register('service:current-user', CurrentUserMemberStub);

      // when
      await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

      // then
      assert.contains('La Panique');
      assert.contains('Jojo');
      assert.contains('Membre');
    });

    test('it should not display the edit button', async function (assert) {
      // given
      this.set('membership', memberMembership);
      this.owner.register('service:current-user', CurrentUserMemberStub);

      // when
      const screen = await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

      // then
      assert.dom(screen.queryByLabelText('Gérer')).doesNotExist();
    });
  });

  module('when current user is an administrator', function () {
    test('it should display a member firstName, lastName, role and edit button', async function (assert) {
      // given
      this.set('membership', memberMembership);
      this.owner.register('service:current-user', CurrentUserAdminStub);

      // when
      const screen = await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

      // then

      assert.contains('La Panique');
      assert.contains('Jojo');
      assert.contains('Membre');
      assert.dom(screen.getByLabelText('Gérer')).exists();
    });

    module('When edit organization role button is clicked', function () {
      test('it should show update and save button, and show the drop down to select role to update', async function (assert) {
        // given
        this.set('membership', adminMembership);
        this.owner.register('service:current-user', CurrentUserAdminStub);

        const screen = await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

        // when
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // then
        assert.dom('.zone-save-cancel-role').exists({ count: 1 });
        assert.dom(screen.queryByLabelText('Annuler')).exists();
        assert.dom(screen.queryByLabelText('Enregistrer')).exists();
      });

      test('it should cancel the update if using the cancel button', async function (assert) {
        // given
        this.set('membership', adminMembership);
        this.owner.register('service:current-user', CurrentUserAdminStub);

        await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);

        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await clickByName('Annuler');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(memberMembership.organizationRole, 'MEMBER');
        sinon.assert.notCalled(memberMembership.save);
      });

      test('it should change the value of the drop down to Administrateur and display the modified role', async function (assert) {
        // given
        this.owner.register('service:current-user', CurrentUserAdminStub);
        this.set('membership', memberMembership);

        await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await selectByLabelAndOption('Sélectionner un rôle', 'ADMIN');
        await clickByText('Enregistrer');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(memberMembership.organizationRole, 'ADMIN');
        sinon.assert.called(memberMembership.save);
      });

      test('it should change the value of the drop down to Membre and display the modified role', async function (assert) {
        // given
        this.set('membership', adminMembership);
        this.owner.register('service:current-user', CurrentUserAdminStub);

        await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
        await clickByText('Enregistrer');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(adminMembership.organizationRole, 'MEMBER');
        sinon.assert.called(adminMembership.save);
      });

      test('it should display success message when updating a member role', async function (assert) {
        // given
        const notifications = this.owner.lookup('service:notifications');
        sinon.stub(notifications, 'success');
        this.set('membership', adminMembership);
        this.owner.register('service:current-user', CurrentUserAdminStub);

        await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
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
        this.owner.register('service:current-user', CurrentUserAdminStub);
        const notifications = this.owner.lookup('service:notifications');
        sinon.stub(notifications, 'error');

        await render(hbs`<Team::MembersListItem @membership={{membership}}/>`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
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
        this.owner.register('service:current-user', CurrentUserAdminStub);
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
});
