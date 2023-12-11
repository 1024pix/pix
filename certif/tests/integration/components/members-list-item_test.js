import { module, test } from 'qunit';
import sinon from 'sinon';
import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';

module('Integration | Component | MembersListItem', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let currentUser;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:current-user');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when current user has a member role', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(false);
    });

    module('when member has a member role', function () {
      test('it shows member firstName, lastName and role', async function (assert) {
        // given
        const memberWithMemberRole = store.createRecord('member', {
          firstName: 'John',
          lastName: 'Williams',
          role: 'MEMBER',
        });

        sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithMemberRole.id });
        this.set('member', memberWithMemberRole);

        // when
        const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

        // then
        assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
        assert.dom(screen.getByRole('cell', { name: 'Williams' })).exists();
        assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.member') })).exists();
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.team.members.role.member') }))
          .doesNotExist();
      });
    });

    module('when member has an admin role', function () {
      test('it shows admin firstName, lastName and role', async function (assert) {
        // given
        const memberWithAdminRole = store.createRecord('member', {
          firstName: 'Maria',
          lastName: 'Carré',
          role: 'ADMIN',
        });

        sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });
        this.set('member', memberWithAdminRole);

        // when
        const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

        // then
        assert.dom(screen.getByRole('cell', { name: 'Maria' })).exists();
        assert.dom(screen.getByRole('cell', { name: 'Carré' })).exists();
        assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.admin') })).exists();
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.team.members.role.member') }))
          .doesNotExist();
      });
    });
  });

  module('when current user has an admin role', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(true);
    });

    module('when not in edit mode', function () {
      module('when member is not the connected user', function () {
        test('it shows member firstName, lastName, role and manage button', async function (assert) {
          // given
          const memberWithMemberRole = store.createRecord('member', {
            id: 123,
            firstName: 'John',
            lastName: 'Williams',
            role: 'MEMBER',
          });

          sinon.stub(currentUser, 'certificationPointOfContact').value({ id: 1 });
          this.set('member', memberWithMemberRole);

          // when
          const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

          // then
          assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
          assert.dom(screen.getByRole('cell', { name: 'Williams' })).exists();
          assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.member') })).exists();
          assert.dom(screen.getByRole('button', { name: this.intl.t('pages.team.members.actions.manage') })).exists();
        });
      });

      module('when member is the connected user', function () {
        test('it shows member firstName, lastName, role but does not show manage button', async function (assert) {
          // given
          const memberWithMemberRole = store.createRecord('member', {
            id: 123,
            firstName: 'John',
            lastName: 'Williams',
            role: 'MEMBER',
          });
          this.set('member', memberWithMemberRole);
          sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithMemberRole.id });

          // when
          const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);

          // then
          assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
          assert.dom(screen.getByRole('cell', { name: 'Williams' })).exists();
          assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.members.role.member') })).exists();
          assert
            .dom(screen.queryByRole('button', { name: this.intl.t('pages.team.members.actions.manage') }))
            .doesNotExist();
        });
      });
    });

    module('when mode edition is enabled', function (hooks) {
      hooks.beforeEach(function () {
        const memberWithMemberRole = store.createRecord('member', {
          id: 123,
          firstName: 'John',
          lastName: 'Williams',
          role: 'MEMBER',
        });

        sinon.stub(currentUser, 'certificationPointOfContact').value({ id: 1 });
        this.set('member', memberWithMemberRole);
      });

      test('it shows role selection menu, save button and cancel button', async function (assert) {
        // given
        // when
        const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);
        await clickByName(this.intl.t('pages.team.members.actions.manage'));
        await clickByName(this.intl.t('pages.team.members.actions.edit-role'));

        // then
        assert.dom(screen.getByLabelText(this.intl.t('pages.team.members.actions.select-role.label'))).exists();
        assert.dom(screen.getByRole('button', { name: this.intl.t('pages.team.members.actions.save') })).exists();
        assert.dom(screen.getByRole('button', { name: this.intl.t('common.actions.cancel') })).exists();
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.team.members.actions.manage') }))
          .doesNotExist();
        assert
          .dom(
            screen.queryByRole('button', {
              name: this.intl.t('pages.team.members.actions.edit-role'),
            }),
          )
          .doesNotExist();
      });

      module('when selecting a new role', function () {
        test('it displays the selected role', async function (assert) {
          // given
          const screen = await renderScreen(hbs`<MembersListItem @member={{this.member}} />`);
          await clickByName(this.intl.t('pages.team.members.actions.manage'));
          await clickByName(this.intl.t('pages.team.members.actions.edit-role'));

          // when
          await clickByName(this.intl.t('pages.team.members.actions.select-role.label'));
          await screen.findByRole('listbox');
          await click(
            screen.getByRole('option', { name: this.intl.t('pages.team.members.actions.select-role.options.admin') }),
          );

          // then
          assert
            .dom(screen.getByRole('button', { name: this.intl.t('pages.team.members.actions.select-role.label') }))
            .containsText(this.intl.t('pages.team.members.actions.select-role.options.admin'));
        });
      });
    });
  });
});
