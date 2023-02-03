import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::MembersList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should list the team members', async function (assert) {
    //given
    const members = [
      {
        id: 1,
        organizationRole: 'ADMIN',
        user: {
          id: 111,
          firstName: 'Gigi',
          lastName: 'La Terreur',
        },
      },
      {
        id: 2,
        organizationRole: 'MEMBER',
        user: {
          id: 121,
          firstName: 'Jojo',
          lastName: 'La Panique',
        },
      },
    ];
    members.meta = { rowCount: 2 };
    this.set('members', members);

    // when
    await render(hbs`<Team::MembersList @members={{this.members}} />`);

    // then
    assert.contains('Gigi');
    assert.contains('Jojo');
  });

  test('it should display a message when there are no members', async function (assert) {
    //given
    this.set('members', []);

    // when
    await render(hbs`<Team::MembersList @members={{this.members}} />`);

    // then
    assert.contains('En attente de membres');
  });
});
