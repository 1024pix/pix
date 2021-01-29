import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | routes/authenticated/team | invitations', function(hooks) {
  setupRenderingTest(hooks);

  test('it should list the pending team invitations', async function(assert) {
    // given
    const organizationInvitations = [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
      { email: 'gogo@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ];
    this.set('organizationInvitations', organizationInvitations);

    // when
    await render(hbs`<Routes::Authenticated::Team::Invitations @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.dom('[aria-label="Invitation en attente"]').exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function(assert) {
    // given
    const organizationInvitations = [
      { email: 'gigi@example.net', updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ];
    this.set('organizationInvitations', organizationInvitations);

    // when
    await render(hbs`<Routes::Authenticated::Team::Invitations @organizationInvitations={{organizationInvitations}}/>`);

    // then
    assert.contains('gigi@example.net');
    assert.contains('Dernière invitation envoyée le 08/10/2019 à 12:50');
  });
});
