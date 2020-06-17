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
    const membership = store.createRecord('membership', {
      id: 1,
      organizationRole: 'ADMIN',
      user: store.createRecord('user', {
        id: 111,
        firstName: 'Gigi',
        lastName: 'La Terreur',
      }),
    });

    this.set('membership', membership);

    // when
    await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('Administrateur');
    assert.contains('Modifier le rôle');

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
    await render(hbs`<Routes::Authenticated::Team::Items @membership={{membership}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('Membre');
    assert.contains('Modifier le rôle');
  });

});
