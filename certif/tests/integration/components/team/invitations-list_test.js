import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  team/invitation-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let cancelInvitation, resendInvitation;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');

    cancelInvitation = sinon.stub();
    resendInvitation = sinon.stub();

    this.set('cancelInvitation', cancelInvitation);
    this.set('resendInvitation', resendInvitation);
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('displays email address, last sending date and actions headers', async function (assert) {
    // given
    this.set('invitations', []);

    // when
    const screen = await renderScreen(
      hbs`<Team::InvitationsList @invitations={{this.invitations}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
    );

    // then
    assert.strictEqual(screen.getAllByRole('columnheader').length, 3);
    assert.dom(screen.getByRole('columnheader', { name: 'Adresse email' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de dernier envoi' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Actions' })).exists();
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
    const screen = await renderScreen(
      hbs`<Team::InvitationsList @invitations={{this.invitations}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
    );

    // then

    assert.strictEqual(screen.getAllByLabelText('Invitations en attente').length, 2);
  });

  module('when the user clicks on the cancel invitation button', function () {
    test('calls the cancel invitation action', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');

      this.set('invitations', [invitation]);

      await renderScreen(
        hbs`<Team::InvitationsList @invitations={{this.invitations}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
      );

      // when
      await clickByName(this.intl.t('pages.team-invitations.actions.cancel-invitation'));

      // then
      assert.ok(cancelInvitation.calledWith(invitation));
    });
  });

  module('when the user clicks on the resend invitation button', function () {
    test('calls the resend invitation action', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');

      this.set('invitations', [invitation]);

      await renderScreen(
        hbs`<Team::InvitationsList @invitations={{this.invitations}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
      );

      // when
      await clickByName(this.intl.t('pages.team-invitations.actions.resend-invitation'));

      // then
      assert.ok(resendInvitation.calledWith(invitation));
    });
  });
});
