import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/team | list-items | items', function(hooks) {

  setupRenderingTest(hooks);

  test('For an admin, it should display an administrator firstName, lastName, role and edit button', async function(assert) {
    // given
    const store = this.owner.lookup('service:store');
    const membership =
      run(() => store.createRecord('membership', {
        id: 1,
        organizationRole: 'ADMIN',
        user: run(() => store.createRecord('user', {
          id: 111,
          firstName: 'Gigi',
          lastName: 'La Terreur',
        })),
      }));

    this.set('membership', membership);

    // when
    await render(hbs`{{routes/authenticated/team/items membership=membership}}`);

    // then
    assert.dom('td:first-child').hasText('La Terreur');
    assert.dom('td:nth-child(2)').hasText('Gigi');
    assert.dom('td:nth-child(3)').hasText('Administrateur');
    assert.dom('td:nth-child(4)').hasText('Modifier le rôle');

  });

  test('For a member, it should display a firstName, lastName, role and edit button', async function(assert) {
    // given
    const store = this.owner.lookup('service:store');
    const membership =
      run(() => store.createRecord('membership', {
        id: 1,
        organizationRole: 'MEMBER',
        user: run(() => store.createRecord('user', {
          id: 111,
          firstName: 'Gigi',
          lastName: 'La Terreur',
        })),
      }));

    this.set('membership', membership);

    // when
    await render(hbs`{{routes/authenticated/team/items membership=membership}}`);

    // then
    assert.dom('td:first-child').hasText('La Terreur');
    assert.dom('td:nth-child(2)').hasText('Gigi');
    assert.dom('td:nth-child(3)').hasText('Membre');
    assert.dom('td:nth-child(4)').hasText('Modifier le rôle');

  });

});
