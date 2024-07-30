import { clickByName, render, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
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
      id: '111',
      firstName: 'Gigi',
      lastName: 'La Terreur',
    });

    const secondUser = store.createRecord('user', {
      id: '112',
      firstName: 'Jojo',
      lastName: 'La Panique',
    });

    adminMembership = store.createRecord('membership', {
      id: '1',
      displayRole: t('pages.team-members.actions.select-role.options.admin'),
      organizationRole: 'ADMIN',
      user,
      save: sinon.stub(),
      rollbackAttributes: sinon.stub(),
    });

    memberMembership = store.createRecord('membership', {
      id: '2',
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
      const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

      // then
      assert.ok(screen.getByText('La Panique'));
      assert.ok(screen.getByText('Jojo'));
      assert.ok(screen.getByText('Membre'));
    });

    test('it should not display the edit button', async function (assert) {
      // given
      this.set('membership', memberMembership);

      // when
      const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

      // then
      assert.notOk(screen.queryByRole('button', { name: t('pages.team-members.actions.manage') }));
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

      assert.ok(screen.getByText('La Panique'));
      assert.ok(screen.getByText('Jojo'));
      assert.ok(screen.getByText('Membre'));
      assert.ok(screen.getByRole('button', { name: t('pages.team-members.actions.manage') }));
    });

    module('When edit organization role button is clicked', function () {
      test('it should show update and save button, and show the drop down to select role to update', async function (assert) {
        // given
        this.set('membership', adminMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

        // when
        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // then
        assert.dom('.zone-save-cancel-role').exists({ count: 1 });
        assert.ok(screen.getByLabelText(t('common.actions.cancel')));
        assert.ok(screen.getByLabelText(t('pages.team-members.actions.save')));
      });

      test('it should cancel the update if using the cancel button', async function (assert) {
        // given
        this.set('membership', adminMembership);

        await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);

        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // when
        await clickByName(t('common.actions.cancel'));

        // then

        assert.strictEqual(memberMembership.organizationRole, 'MEMBER');
        sinon.assert.notCalled(memberMembership.save);
      });

      test('it should change the value of the drop down to Administrateur and display the modified role', async function (assert) {
        // given
        this.set('membership', memberMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // when
        await click(screen.getByLabelText(t('pages.team-members.actions.select-role.label')));
        await click(
          await screen.findByRole('option', {
            name: t('pages.team-members.actions.select-role.options.admin'),
          }),
        );

        // then
        assert.ok(
          screen.getByRole('option', {
            selected: true,
            name: t('pages.team-members.actions.select-role.options.admin'),
          }),
        );
        await clickByName(t('pages.team-members.actions.save'));
        assert.strictEqual(memberMembership.organizationRole, 'ADMIN');
        sinon.assert.called(memberMembership.save);
      });

      test('it should change the value of the drop down to Membre and display the modified role', async function (assert) {
        // given
        this.set('membership', adminMembership);

        const screen = await render(hbs`<Team::MembersListItem @membership={{this.membership}} />`);
        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // when
        await click(screen.getByLabelText(t('pages.team-members.actions.select-role.label')));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByName(t('pages.team-members.actions.save'));

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
        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // when
        await click(screen.getByLabelText(t('pages.team-members.actions.select-role.label')));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByName(t('pages.team-members.actions.save'));

        // then
        sinon.assert.calledWith(
          notifications.success,
          t('pages.team-members.notifications.change-member-role.success'),
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
        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));

        // when
        await click(screen.getByLabelText(t('pages.team-members.actions.select-role.label')));
        await click(await screen.findByRole('option', { name: 'Membre' }));
        await clickByName(t('pages.team-members.actions.save'));

        // then
        sinon.assert.calledWith(notifications.error, t('pages.team-members.notifications.change-member-role.error'));
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

        await clickByName(t('pages.team-members.actions.manage'));
        await clickByName(t('pages.team-members.actions.remove-membership'));

        await screen.findByRole('dialog');
      });

      test('should display a confirmation modal', function (assert) {
        // then
        assert.ok(screen.getByText(t('pages.team-members.actions.remove-membership')));
        assert.ok(screen.getByRole('button', { name: t('common.actions.cancel') }));
        assert.ok(screen.getByRole('button', { name: t('pages.team-members.actions.remove-membership') }));
      });

      test('should display the membership first name and last name in the modal', function (assert) {
        // then
        assert.ok(screen.getByText(memberMembership.user.get('firstName')));
        assert.ok(screen.getByText(memberMembership.user.get('lastName')));
      });

      test('should close the modal by clicking on cancel button', async function (assert) {
        // when
        await clickByName(t('common.actions.cancel'));

        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

        // then
        assert.notOk(
          screen.queryByRole('heading', {
            level: 1,
            name: t('pages.team-members.remove-membership-modal.title'),
          }),
        );
      });

      test('should call removeMembership and close modal by clicking on remove button', async function (assert) {
        // when
        await clickByName(t('pages.team-members.remove-membership-modal.actions.remove'));

        // then
        sinon.assert.calledWith(removeMembershipStub, memberMembership);

        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

        assert
          .dom(
            screen.queryByRole('heading', {
              level: 1,
              name: t('pages.team-members.remove-membership-modal.title'),
            }),
          )
          .doesNotExist();
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
          id: '3',
          displayRole: 'Administrateur',
          organizationRole: 'ADMIN',
          user: store.createRecord('user', {
            id: '113',
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
        await clickByName(t('pages.team-members.actions.manage'));
        await click(screen.getByRole('button', { name: t('pages.team-members.actions.leave-organization') }));
        await screen.findByRole('dialog');
        await click(screen.getByRole('button', { name: t('common.actions.confirm') }));

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
