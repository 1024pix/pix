import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  team/invitation-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('displays email address, last sending date and actions headers', async function (assert) {
    // given
    this.set('invitations', []);

    // when
    const screen = await renderScreen(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);

    // then
    assert.strictEqual(screen.getAllByRole('columnheader').length, 3);
    assert.dom(screen.getByRole('columnheader', { name: this.intl.t('Adresse email') })).exists();
    assert
      .dom(
        screen.getByRole('columnheader', {
          name: this.intl.t('Date de dernier envoi'),
        }),
      )
      .exists();
    assert.dom(screen.getByRole('columnheader', { name: this.intl.t('Actions') })).exists();
  });

  test('displays pending invitations list ', async function (assert) {
    // given
    const invitation = store.createRecord('certification-center-invitation', {
      id: 1,
      email: 'camille.onette@example.net',
      updatedAt: new Date('2023-09-21T16:21:12Z'),
    });

    const secondInvitation = store.createRecord('certification-center-invitation', {
      id: 2,
      email: 'lee.tige@example.net',
      updatedAt: new Date('2023-09-20T16:21:12Z'),
    });

    this.set('invitations', [invitation, secondInvitation]);

    //  when
    const screen = await renderScreen(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);

    // then

    assert.strictEqual(screen.getAllByLabelText('Invitations en attente').length, 2);
  });
});
