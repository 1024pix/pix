import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | organization-invitations', function (hooks) {
  setupRenderingTest(hooks);

  test('it should list the pending team invitations', async function (assert) {
    // given
    this.set('invitations', [
      {
        email: 'riri@example.net',
        role: 'ADMIN',
        roleInFrench: 'Administrateur',
        updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2),
      },
      {
        email: 'fifi@example.net',
        role: 'MEMBER',
        roleInFrench: 'Membre',
        updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2),
      },
      {
        email: 'loulou@example.net',
        role: null,
        roleInFrench: '-',
        updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2),
      },
    ]);

    // when
    await render(hbs`<Organizations::Invitations @invitations={{invitations}}/>`);

    // then
    assert.contains('Membre');
    assert.contains('Administrateur');
    assert.contains('-');
    assert.notContains('Aucune invitation en attente');
  });

  test('it should display a message when there is no invitations', async function (assert) {
    // given
    this.set('invitations', []);

    // when
    await render(hbs`<Organizations::Invitations @invitations={{invitations}}/>`);

    // then
    assert.contains('Aucune invitation en attente');
  });
});
