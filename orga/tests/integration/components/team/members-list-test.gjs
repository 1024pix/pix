import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import TeamMembersList from 'pix-orga/components/team/members-list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::MembersList', function (hooks) {
  let memberList;

  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    class CurrentUserMemberStub extends Service {
      isAdminInOrganization = true;
      organization = store.createRecord('organization', {
        name: 'Super Orga',
      });
      prescriber = {
        id: '111',
        firstName: 'Gigi',
        lastName: 'La Terreur',
      };
    }
    this.owner.register('service:current-user', CurrentUserMemberStub);

    const [adminUser, memberUser] = [
      store.createRecord('user', {
        id: '111',
        firstName: 'Gigi',
        lastName: 'La Terreur',
      }),
      store.createRecord('user', {
        id: '121',
        firstName: 'Jojo',
        lastName: 'La Panique',
      }),
    ];

    memberList = [
      store.createRecord('membership', {
        id: '1',
        displayRole: t('pages.team-members.actions.select-role.options.admin'),
        organizationRole: 'ADMIN',
        user: adminUser,
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      }),
      store.createRecord('membership', {
        id: '2',
        displayRole: t('pages.team-members.actions.select-role.options.member'),
        organizationRole: 'MEMBER',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
        user: memberUser,
      }),
    ];
  });

  test('it lists the team members', async function (assert) {
    //given
    const members = memberList.slice();
    members.meta = { rowCount: 2 };

    // when
    const screen = await render(<template><TeamMembersList @members={{members}} /></template>);

    // then
    assert.ok(screen.getByText('Gigi'));
    assert.ok(screen.getByText('Jojo'));
  });

  test('it displays a message when there are no members', async function (assert) {
    //given
    const emptyMembers = [];

    // when
    const screen = await render(<template><TeamMembersList @members={{emptyMembers}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.team-members.table.empty')));
  });

  module('when updating a team member role to "ADMIN"', function () {
    test('it does not display dropdown icon on the admin member before confirming update', async function (assert) {
      // given
      const members = memberList.slice();
      members.meta = { rowCount: 2 };

      // when
      const screen = await render(<template><TeamMembersList @members={{members}} /></template>);

      await clickByName(t('pages.team-members.actions.manage'));
      await clickByName(t('pages.team-members.actions.edit-organization-membership-role'));
      await clickByName(t('pages.team-members.actions.select-role.label'));
      await click(
        await screen.findByRole('option', {
          name: t('pages.team-members.actions.select-role.options.admin'),
        }),
      );

      // then
      assert.notOk(screen.queryByText(t('pages.team-members.actions.manage')));

      await clickByName(t('pages.team-members.actions.save'));
      assert.strictEqual(screen.queryAllByRole('button', { name: t('pages.team-members.actions.manage') }).length, 2);
    });
  });
});
