import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  team/invitation-list-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('displays a pending invitation table row item', async function (assert) {
    // given
    const invitation = store.createRecord('certification-center-invitation', {
      id: 1,
      email: 'camille.onette@example.net',
      updatedAt: new Date('2023-09-21T16:21:12Z'),
    });

    this.set('invitation', invitation);

    //  when
    const screen = await renderScreen(hbs`<Team::InvitationsListItem @invitation={{this.invitation}} />`);

    // then
    const expectedDate = dayjs(invitation.updatedAt).format('DD/MM/YYYY - HH:mm');

    assert.dom(screen.getByLabelText('Invitations en attente')).containsText(invitation.email);
    assert.dom(screen.getByLabelText('Invitations en attente')).containsText(expectedDate);
  });
});
