import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import MembersTable from 'pix-certif/components/members-table';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Members Table', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let currentUser;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:current-user');
  });

  test('it displays members firstName, lastName and role', async function (assert) {
    // given
    const memberWithMemberRole = store.createRecord('member', {
      id: 111,
      firstName: 'John',
      lastName: 'Williams',
      role: 'MEMBER',
    });
    const memberWithAdminRole = store.createRecord('member', {
      id: 222,
      firstName: 'Maria',
      lastName: 'Carré',
      role: 'ADMIN',
    });
    const members = [memberWithMemberRole, memberWithAdminRole];

    // when
    const screen = await render(<template><MembersTable @members={{members}} /></template>);

    // then
    const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
    assert.dom(screen.getByRole('columnheader', { name: t('common.labels.candidate.lastname') })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: t('common.labels.candidate.firstname') })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: t('common.labels.candidate.lastname') })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: t('common.labels.candidate.role') })).exists();
    assert.dom(within(table).getByRole('row', { name: 'Williams John Membre' })).exists();
    assert.dom(within(table).getByRole('row', { name: 'Carré Maria Administrateur' })).exists();
  });

  module('#shouldDisplayManagingColumn', function () {
    module('when current user has a member role', function () {
      test('it not display manage buttons', async function (assert) {
        // given
        sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(false);
        const memberWithMemberRole = store.createRecord('member', {
          id: 111,
          firstName: 'John',
          lastName: 'Williams',
          role: 'MEMBER',
        });
        const memberWithAdminRole = store.createRecord('member', {
          id: 222,
          firstName: 'Maria',
          lastName: 'Carré',
          role: 'ADMIN',
        });
        const members = [memberWithMemberRole, memberWithAdminRole];

        // when
        const screen = await render(<template><MembersTable @members={{members}} /></template>);

        // then
        const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
        assert
          .dom(within(table).queryByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
          .doesNotExist();
        assert
          .dom(
            within(table).queryByRole('button', { name: t('pages.team.members.actions.leave-certification-center') }),
          )
          .doesNotExist();
        assert
          .dom(within(table).queryByRole('button', { name: t('pages.team.members.actions.edit-role') }))
          .doesNotExist();
        assert
          .dom(within(table).queryByRole('button', { name: t('pages.team.members.actions.remove-membership') }))
          .doesNotExist();
      });
    });

    module('when current user has an admin role', function (hooks) {
      hooks.beforeEach(function () {
        sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').value(true);
      });

      module('when user is the only one member', function () {
        test('it not display manage buttons', async function (assert) {
          // given
          const memberWithAdminRole = store.createRecord('member', {
            id: 222,
            firstName: 'Maria',
            lastName: 'Carré',
            role: 'ADMIN',
          });
          const members = [memberWithAdminRole];
          sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });

          // when
          const screen = await render(<template><MembersTable @members={{members}} /></template>);

          // then
          const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
          assert
            .dom(within(table).queryByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
            .doesNotExist();
          assert
            .dom(
              within(table).queryByRole('button', { name: t('pages.team.members.actions.leave-certification-center') }),
            )
            .doesNotExist();
          assert
            .dom(within(table).queryByRole('button', { name: t('pages.team.members.actions.edit-role') }))
            .doesNotExist();
          assert
            .dom(within(table).queryByRole('button', { name: t('pages.team.members.actions.remove-membership') }))
            .doesNotExist();
        });
      });

      module('when there are multiple members', function () {
        module('For edit role button', function () {
          module('When there are multiple ADMIN roles', function () {
            test('it displays buttons for all except current user', async function (assert) {
              // given
              const memberWithAdminRole = store.createRecord('member', {
                id: 222,
                firstName: 'Maria',
                lastName: 'Carré',
                role: 'ADMIN',
              });
              const otherMemberWithAdminRole = store.createRecord('member', {
                id: 111,
                firstName: 'John',
                lastName: 'Williams',
                role: 'ADMIN',
              });
              const members = [otherMemberWithAdminRole, memberWithAdminRole];
              sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });

              // when
              const screen = await render(<template><MembersTable @members={{members}} /></template>);

              // then
              const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
              assert
                .dom(within(table).getByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
                .exists();
              const buttons = within(table).getAllByRole('button', { name: t('pages.team.members.actions.edit-role') });
              assert.strictEqual(buttons.length, 1);
              assert
                .dom(
                  within(table).getByRole('row', { name: 'Williams John Administrateur Modifier le rôle Supprimer' }),
                )
                .exists();
              assert
                .dom(
                  within(table).queryByRole('row', { name: 'Carré Maria Administrateur Modifier le rôle Supprimer' }),
                )
                .doesNotExist();
            });
          });

          module('When others have only MEMBER roles', function () {
            test('it displays buttons for all except current user', async function (assert) {
              // given
              const memberWithMemberRole = store.createRecord('member', {
                id: 111,
                firstName: 'John',
                lastName: 'Williams',
                role: 'MEMBER',
              });
              const memberWithAdminRole = store.createRecord('member', {
                id: 222,
                firstName: 'Maria',
                lastName: 'Carré',
                role: 'ADMIN',
              });
              const members = [memberWithMemberRole, memberWithAdminRole];
              sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });

              // when
              const screen = await render(<template><MembersTable @members={{members}} /></template>);

              // then
              const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
              assert
                .dom(within(table).getByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
                .exists();
              const buttons = within(table).getAllByRole('button', { name: t('pages.team.members.actions.edit-role') });
              assert.strictEqual(buttons.length, 1);
              assert
                .dom(within(table).getByRole('row', { name: 'Williams John Membre Modifier le rôle Supprimer' }))
                .exists();
              assert
                .dom(
                  within(table).queryByRole('row', { name: 'Carré Maria Administrateur Modifier le rôle Supprimer' }),
                )
                .doesNotExist();
            });
          });
        });

        module('For remove member button', function () {
          test('it displays buttons for all except current user', async function (assert) {
            // given
            const memberWithMemberRole = store.createRecord('member', {
              id: 111,
              firstName: 'John',
              lastName: 'Williams',
              role: 'MEMBER',
            });
            const memberWithAdminRole = store.createRecord('member', {
              id: 222,
              firstName: 'Maria',
              lastName: 'Carré',
              role: 'ADMIN',
            });
            const members = [memberWithMemberRole, memberWithAdminRole];
            sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });

            // when
            const screen = await render(<template><MembersTable @members={{members}} /></template>);

            // then
            const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
            const buttons = within(table).getAllByRole('button', {
              name: t('pages.team.members.actions.remove-membership'),
            });
            assert.strictEqual(buttons.length, 1);
            assert
              .dom(within(table).getByRole('row', { name: 'Williams John Membre Modifier le rôle Supprimer' }))
              .exists();
            assert
              .dom(within(table).queryByRole('row', { name: 'Carré Maria Administrateur Modifier le rôle Supprimer' }))
              .doesNotExist();
          });
        });

        module('For leaving centre button', function () {
          module('When there are multiple ADMIN roles', function () {
            test('it displays buttons only for current user', async function (assert) {
              // given
              const memberWithMemberRole = store.createRecord('member', {
                id: 111,
                firstName: 'John',
                lastName: 'Williams',
                role: 'MEMBER',
              });
              const memberWithAdminRole = store.createRecord('member', {
                id: 222,
                firstName: 'Maria',
                lastName: 'Carré',
                role: 'ADMIN',
              });
              const otherMemberWithAdminRole = store.createRecord('member', {
                id: 333,
                firstName: 'Alain',
                lastName: 'Verse',
                role: 'ADMIN',
              });
              sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });
              const members = [memberWithMemberRole, memberWithAdminRole, otherMemberWithAdminRole];

              // when
              const screen = await render(<template><MembersTable @members={{members}} /></template>);

              // then
              const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
              assert
                .dom(within(table).getByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
                .exists();
              const buttons = within(table).getAllByRole('button', {
                name: t('pages.team.members.actions.leave-certification-center'),
              });
              assert.strictEqual(buttons.length, 1);
              assert
                .dom(within(table).getByRole('row', { name: 'Williams John Membre Modifier le rôle Supprimer' }))
                .exists();
              assert
                .dom(
                  within(table).queryByRole('row', {
                    name: 'Carré Maria Administrateur Modifier le rôle Quitter le centre',
                  }),
                )
                .doesNotExist();
              assert
                .dom(
                  within(table).queryByRole('row', { name: 'Alain Verse Administrateur Modifier le rôle Supprimer' }),
                )
                .doesNotExist();
            });
          });

          //todo
          module('When others have only MEMBER roles', function () {
            test('it not displays button', async function (assert) {
              // given
              const memberWithMemberRole = store.createRecord('member', {
                id: 111,
                firstName: 'John',
                lastName: 'Williams',
                role: 'MEMBER',
              });
              const memberWithAdminRole = store.createRecord('member', {
                id: 222,
                firstName: 'Maria',
                lastName: 'Carré',
                role: 'ADMIN',
              });
              const members = [memberWithMemberRole, memberWithAdminRole];
              sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });

              // when
              const screen = await render(<template><MembersTable @members={{members}} /></template>);

              // then
              const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
              assert
                .dom(within(table).getByRole('columnheader', { name: t('pages.team.table-headers.actions') }))
                .exists();
              assert
                .dom(
                  within(table).queryByRole('button', {
                    name: t('pages.team.members.actions.leave-certification-center'),
                  }),
                )
                .doesNotExist();
            });
          });
        });
      });
    });
  });

  module('#shouldDisplayRefererColumn', function () {
    module('when certification center is habilitated CléA', function () {
      test('it shows the referer column', async function (assert) {
        // given
        const memberWithAdminRole = store.createRecord('member', {
          id: 222,
          firstName: 'Maria',
          lastName: 'Carré',
          role: 'ADMIN',
        });
        const members = [memberWithAdminRole];

        // when
        const screen = await render(
          <template><MembersTable @members={{members}} @hasCleaHabilitation={{true}} /></template>,
        );

        // then
        const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
        assert.dom(within(table).getByRole('columnheader', { name: t('pages.team.referer') })).exists();
      });

      module('when a member is referer', function () {
        test('it shows the referer tag', async function (assert) {
          // given
          const memberWithAdminRole = store.createRecord('member', {
            id: 222,
            firstName: 'Maria',
            lastName: 'Carré',
            role: 'ADMIN',
            isReferer: true,
          });
          const members = [memberWithAdminRole];

          // when
          const screen = await render(
            <template><MembersTable @members={{members}} @hasCleaHabilitation={{true}} /></template>,
          );

          // then
          const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
          assert.dom(within(table).getByRole('cell', { name: t('pages.team.pix-referer') })).exists();
        });
      });

      module('when there is no referer', function () {
        test('it does not show the referer tag', async function (assert) {
          // given
          const memberWithAdminRole = store.createRecord('member', {
            id: 222,
            firstName: 'Maria',
            lastName: 'Carré',
            role: 'ADMIN',
            isReferer: false,
          });
          const members = [memberWithAdminRole];

          // when
          const screen = await render(
            <template><MembersTable @members={{members}} @hasCleaHabilitation={{true}} /></template>,
          );

          // then
          const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
          assert.dom(within(table).queryByRole('cell', { name: t('pages.team.pix-referer') })).doesNotExist();
        });
      });
    });

    module('when certification center is not habilitated CléA', function () {
      test('it not displays the referer column', async function (assert) {
        // given
        const memberWithAdminRole = store.createRecord('member', {
          id: 222,
          firstName: 'Maria',
          lastName: 'Carré',
          role: 'ADMIN',
        });
        const members = [memberWithAdminRole];

        // when
        const screen = await render(
          <template><MembersTable @members={{members}} @hasCleaHabilitation={{false}} /></template>,
        );

        // then
        const table = screen.getByRole('table', { name: t('pages.team.table.caption') });
        assert.dom(within(table).queryByRole('columnheader', { name: t('pages.team.referer') })).doesNotExist();
      });
    });
  });
});
