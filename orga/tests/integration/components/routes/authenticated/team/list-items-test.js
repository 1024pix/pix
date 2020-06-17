import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | routes/authenticated/team | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of members', async function(assert) {
    // given
    const store = this.owner.lookup('service:store');
    const memberships = [
      store.createRecord('membership', {
        id: 1,
        organizationRole: 'ADMIN',
        user: run(() => store.createRecord('user', {
          id: 111,
          firstName: 'Gigi',
          lastName: 'La Terreur',
        })),
      }),
      store.createRecord('membership', {
        id: 2,
        organizationRole: 'MEMBER',
        user: run(() => store.createRecord('user', {
          id: 112,
          firstName: 'Gogo',
          lastName: 'L\'asticot',
        })),
      }),
    ];
    memberships.meta = { rowCount: 2 };
    this.set('memberships', memberships);

    // when
    await render(hbs`<Routes::Authenticated::Team::ListItems @memberships={{memberships}}/>`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });
  });

  test('it should display a list of invitations', async function(assert) {
    // given
    this.set('organizationInvitations', [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
      { email: 'gogo@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ]);

    // when
    await render(hbs`<Routes::Authenticated::Team::ListItems @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.dom('[aria-label="Invitation en attente"]').exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function(assert) {
    // given
    this.set('organizationInvitations', [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ]);

    // when
    await render(hbs`<Routes::Authenticated::Team::ListItems @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.contains('gigi@example.net');
    assert.contains('Dernière invitation envoyée le 08/10/2019 à 12:50');
  });
});
