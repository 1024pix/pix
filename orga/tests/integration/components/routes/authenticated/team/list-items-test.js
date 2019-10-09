import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/team | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of members, their firstName and lastName', async function(assert) {
    // given
    this.set('memberships', [
      { user: { firstName: 'Gigi', lastName: 'La Terreur' } },
      { user: { firstName: 'Gogo', lastName: 'L\'asticot' } },
    ]);

    // when
    await render(hbs`{{routes/authenticated/team/list-items memberships=memberships}}`);

    // then
    assert.dom('#table-members tbody tr').exists({ count: 2 });
    assert.dom('#table-members tbody tr:first-child td:first-child').hasText('La Terreur');
    assert.dom('#table-members tbody tr:first-child td:last-child').hasText('Gigi');
  });

  test('it should display a list of invitations, their email and creation date', async function(assert) {
    // given
    this.set('organizationInvitations', [
      { email: 'gigi@pix.fr', createdAt: new Date('2019-10-08') },
      { email: 'gogo@pix.fr', createdAt: new Date('2019-10-08') },
    ]);

    // when
    await render(hbs`{{routes/authenticated/team/list-items organizationInvitations=organizationInvitations}}`);

    // then
    assert.dom('#table-invitations tbody tr').exists({ count: 2 });
    assert.dom('#table-invitations tbody tr:last-child td:first-child').hasText('gogo@pix.fr');
    assert.dom('#table-invitations tbody tr:last-child td:nth-child(2)').hasText('Invité le 08/10/2019');
  });
});
