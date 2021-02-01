import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/team | members', function(hooks) {

  setupRenderingTest(hooks);

  test('it should list the team members', async function(assert) {
    //given
    const memberships = [{
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
    }];
    memberships.meta = { rowCount: 2 };
    this.set('memberships', memberships);

    // when
    await render(hbs`<Routes::Authenticated::Team::Members @memberships={{memberships}}/>`);

    // then
    assert.dom('#table-members tbody tr').exists({ count: 2 });
  });

  test('it should display a message when there are no members', async function(assert) {
    //given
    this.set('memberships', []);

    // when
    await render(hbs`<Routes::Authenticated::Team::Members @memberships={{memberships}}/>`);

    // then
    assert.contains('En attente de membres');
  });
});
