import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/team | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of members', async function(assert) {
    // given
    const memberships = [
      { user: { firstName: 'Gigi', lastName: 'La Terreur' } },
      { user: { firstName: 'Gogo', lastName: 'L\'asticot' } },
    ];

    this.set('memberships', memberships);

    // when
    await render(hbs`{{routes/authenticated/team/list-items memberships=memberships}}`);

    // then
    assert.dom('.table tbody tr').exists();
    assert.dom('.table tbody tr').exists({ count: 2 });
  });

  test('it should display the firstName and lastName of member', async function(assert) {
    // given
    const memberships = [
      { user: { firstName: 'Gigi', lastName: 'La Terreur' } },
      { user: { firstName: 'Gogo', lastName: 'L\'asticot' } },
    ];

    this.set('memberships', memberships);

    // when
    await render(hbs`{{routes/authenticated/team/list-items memberships=memberships}}`);

    // then
    assert.dom('.table tbody tr:first-child td:first-child').hasText('La Terreur');
    assert.dom('.table tbody tr:first-child td:last-child').hasText('Gigi');
  });
});
