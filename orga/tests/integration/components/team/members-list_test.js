import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::MembersList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should list the team members', async function (assert) {
    //given
    class CurrentUserMemberStub extends Service {
      isAdminInOrganization = false;
      organization = {
        credit: 10000,
        name: 'Super Orga',
      };
    }
    this.owner.register('service:current-user', CurrentUserMemberStub);

    const members = [
      {
        id: '1',
        organizationRole: 'ADMIN',
        user: {
          id: '111',
          firstName: 'Gigi',
          lastName: 'La Terreur',
        },
      },
      {
        id: '2',
        organizationRole: 'MEMBER',
        user: {
          id: '121',
          firstName: 'Jojo',
          lastName: 'La Panique',
        },
      },
    ];
    members.meta = { rowCount: 2 };
    this.set('members', members);

    // when
    const screen = await render(hbs`<Team::MembersList @members={{this.members}} />`);

    // then
    assert.ok(screen.getByText('Gigi'));
    assert.ok(screen.getByText('Jojo'));
  });

  test('it should display a message when there are no members', async function (assert) {
    //given
    this.set('members', []);

    // when
    const screen = await render(hbs`<Team::MembersList @members={{this.members}} />`);

    // then
    assert.ok(screen.getByText(this.intl.t('pages.team-members.table.empty')));
  });
});
