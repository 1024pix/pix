import { clickByName, clickByText, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::MembersListItem', function (hooks) {
  setupIntlRenderingTest(hooks);
  let adminMembership;
  let memberMembership;
  let store;
  let organization;
  let prescriber;

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());

    store = this.owner.lookup('service:store');

    organization = store.createRecord('organization', { id: '18', credit: '10000' });
    prescriber = store.createRecord('prescriber', { id: '344535' });

    const user = store.createRecord('user', {
      id: 111,
      firstName: 'Gigi',
      lastName: 'La Terreur',
    });

    const secondUser = store.createRecord('user', {
      id: 112,
      firstName: 'Jojo',
      lastName: 'La Panique',
    });

    adminMembership = store.createRecord('membership', {
      id: 1,
      displayRole: 'Administrateur',
      organizationRole: 'ADMIN',
      user,
      save: sinon.stub(),
      rollbackAttributes: sinon.stub(),
    });

    memberMembership = store.createRecord('membership', {
      id: 2,
      displayRole: 'Membre',
      organizationRole: 'MEMBER',
      user: secondUser,
      save: sinon.stub(),
      rollbackAttributes: sinon.stub(),
    });
  });

  module('when user is a member', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserMemberStub extends Service {
        isAdminInOrganization = false;
        organization = organization;
      }
      this.owner.register('service:current-user', CurrentUserMemberStub);
    });

    test('it should display a member, firstName, lastName and role', async function (assert) {
      // given
      this.set('membership', memberMembership);

      // when
      await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

      // then
      assert.contains('La Panique');
      assert.contains('Jojo');
      assert.contains('Membre');
    });

    test('it should not display the edit button', async function (assert) {
      // given
      this.set('membership', memberMembership);

      // when
      const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

      // then
      assert.dom(screen.queryByLabelText('Gérer')).doesNotExist();
    });
  });

  module('when current user is an administrator', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserAdminStub extends Service {
        isAdminInOrganization = true;
        organization = organization;
        prescriber = prescriber;
      }

      this.owner.register('service:current-user', CurrentUserAdminStub);
    });

    test('it should display a member firstName, lastName, role and edit button', async function (assert) {
      // given
      this.set('membership', memberMembership);

      // when
      const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

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

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

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

        await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await clickByName('Annuler');

        // then

        assert.strictEqual(memberMembership.organizationRole, 'MEMBER');
        sinon.assert.notCalled(memberMembership.save);
      });

      test('it should change the value of the drop down to Administrateur and display the modified role', async function (assert) {
        // given
        this.set('membership', memberMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await click(screen.getByLabelText('Sélectionner un rôle'));
        await click(await screen.findByRole('option', { name: 'Administrateur' }));

        // then
        assert.dom(screen.getByRole('option', { selected: true, name: 'Administrateur' })).exists();
        await clickByText('Enregistrer');
        assert.strictEqual(memberMembership.organizationRole, 'ADMIN');
        sinon.assert.called(memberMembership.save);
      });

      test('it should change the value of the drop down to Membre and display the modified role', async function (assert) {
        // given
        this.set('membership', adminMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await click(screen.getByLabelText('Sélectionner un rôle'));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByText('Enregistrer');

        // then

        assert.strictEqual(adminMembership.organizationRole, 'MEMBER');
        sinon.assert.called(adminMembership.save);
      });

      test('it should display success message when updating a member role', async function (assert) {
        // given
        const notifications = this.owner.lookup('service:notifications');
        sinon.stub(notifications, 'success');
        this.set('membership', adminMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await click(screen.getByLabelText('Sélectionner un rôle'));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByText('Enregistrer');

        // then
        sinon.assert.calledWith(
          notifications.success,
          this.intl.t('pages.team-members.notifications.change-member-role.success'),
        );
        assert.ok(true);
      });

      test('it should display error message when updating a member role fails', async function (assert) {
        // given
        adminMembership.save.rejects();
        this.set('membership', adminMembership);
        const notifications = this.owner.lookup('service:notifications');
        sinon.stub(notifications, 'error');

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName('Gérer');
        await clickByText('Modifier le rôle');

        // when
        await click(screen.getByLabelText('Sélectionner un rôle'));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByText('Enregistrer');

        // then
        sinon.assert.calledWith(
          notifications.error,
          this.intl.t('pages.team-members.notifications.change-member-role.error'),
        );
        assert.ok(true);
      });
    });

    module('When remove member button is clicked', (hooks) => {
      let removeMembershipStub;
      let screen;

      hooks.beforeEach(async function () {
        // given
        removeMembershipStub = sinon.stub();

        this.set('membership', memberMembership);
        this.set('removeMembership', removeMembershipStub);

        // when
        screen = await render(
          hbs`<Team::MembersListItem @membership={{this.membership}} @onRemoveMember={{this.removeMembership}} />`,
        );

        await clickByName('Gérer');
        await clickByText('Supprimer');

        await screen.findByRole('dialog');
      });

      test('should display a confirmation modal', function (assert) {
        // then
        assert.contains('Confirmez-vous la suppression ?');
        assert.contains('Annuler');
        assert.contains('Supprimer');
      });

      test('should display the membership first name and last name in the modal', function (assert) {
        // then
        assert.contains(memberMembership.user.get('firstName'));
        assert.contains(memberMembership.user.get('lastName'));
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

  module('when there is multiple administrators', function () {
    module('when current admin wants to leave the organization', function () {
      class CurrentLeavingUserAdminStub extends Service {
        isAdminInOrganization = true;
        prescriber = {
          id: '113',
        };
        organization = {
          credit: 10000,
        };
      }

      test('removes current administrator access to the organization, displays a success notification and invalidate the current session', async function (assert) {
        // given
        this.owner.register('service:current-user', CurrentLeavingUserAdminStub);
        const notificationsService = this.owner.lookup('service:notifications');
        const sessionService = this.owner.lookup('service:session');

        const leavingAdminMembership = store.createRecord('membership', {
          id: 3,
          displayRole: 'Administrateur',
          organizationRole: 'ADMIN',
          user: store.createRecord('user', {
            id: 113,
            firstName: 'Dimi',
            lastName: 'Trie',
          }),
        });
        const onLeaveOrganizationStub = sinon.stub().resolves();

        this.set('membership', leavingAdminMembership);
        this.set('isMultipleAdminsAvailable', true);
        this.set('onLeaveOrganization', onLeaveOrganizationStub);

        sinon.stub(notificationsService, 'sendSuccess');
        sinon.stub(sessionService, 'waitBeforeInvalidation');
        sinon.stub(sessionService, 'invalidate');

        // when
        const screen = await render(
          hbs`<Team::MembersListItem
  @membership={{this.membership}}
  @isMultipleAdminsAvailable={{this.isMultipleAdminsAvailable}}
  @onRemoveMember={{this.noop}}
  @onLeaveOrganization={{this.onLeaveOrganization}}
/>`,
        );
        await clickByName('Gérer');
        await click(screen.getByRole('button', { name: 'Quitter cet espace Pix Orga' }));
        await screen.findByRole('dialog');
        await click(screen.getByRole('button', { name: 'Confirmer' }));

        // then
        sinon.assert.calledWith(onLeaveOrganizationStub, leavingAdminMembership);
        sinon.assert.called(notificationsService.sendSuccess);
        sinon.assert.called(sessionService.waitBeforeInvalidation);
        sinon.assert.called(sessionService.invalidate);
        assert.ok(true);
      });
    });
  });
});
