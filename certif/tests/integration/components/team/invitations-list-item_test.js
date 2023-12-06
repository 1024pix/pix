import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component |  team/invitation-list-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('displays a pending invitation table row item', async function (assert) {
    // given
    const invitation = store.createRecord('certification-center-invitation', {
      id: 1,
      email: 'camille.onette@example.net',
      updatedAt: new Date('2023-09-21T16:21:12Z'),
    });

    this.set('invitation', invitation);
    this.set('cancelInvitation', sinon.stub());
    this.set('resendInvitation', sinon.stub());

    //  when
    const screen = await renderScreen(
      hbs`<Team::InvitationsListItem @invitation={{this.invitation}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
    );

    // then
    const expectedDate = dayjs(invitation.updatedAt).format('DD/MM/YYYY - HH:mm');

    assert.dom(screen.getByLabelText('Invitations en attente')).containsText(invitation.email);
    assert.dom(screen.getByLabelText('Invitations en attente')).containsText(expectedDate);
    assert.dom(screen.getByRole('button', { name: "Renvoyer l'invitation" })).exists();
    assert.dom(screen.getByRole('button', { name: "Supprimer l'invitation" })).exists();
  });

  module('when the user clicks on the cancel invitation button', function () {
    test('calls the cancel invitation action', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');
      const cancelInvitation = sinon.stub();

      this.set('invitation', invitation);
      this.set('cancelInvitation', cancelInvitation);
      this.set('resendInvitation', sinon.stub());

      await renderScreen(
        hbs`<Team::InvitationsListItem @invitation={{this.invitation}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
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
      const resendInvitation = sinon.stub();

      this.set('invitation', invitation);
      this.set('cancelInvitation', sinon.stub());
      this.set('resendInvitation', resendInvitation);

      await renderScreen(
        hbs`<Team::InvitationsListItem @invitation={{this.invitation}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
      );

      // when
      await clickByName(this.intl.t('pages.team-invitations.actions.resend-invitation'));

      // then
      assert.ok(resendInvitation.calledWith(invitation));
    });
  });

  module('when certification center invitation has already been resent', function () {
    test('disables the resend invitation button', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');

      invitation.isResendingInvitation = true;

      this.set('invitation', invitation);
      this.set('cancelInvitation', sinon.stub());
      this.set('resendInvitation', sinon.stub());

      // when
      const screen = await renderScreen(
        hbs`<Team::InvitationsListItem @invitation={{this.invitation}} @onCancelInvitationButtonClicked={{this.cancelInvitation}} @onResendInvitationButtonClicked={{this.resendInvitation}} />`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: "Renvoyer l'invitation" })).isDisabled();
    });
  });
});
