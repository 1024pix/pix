import { clickByName, render as renderScreen, within } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import { t } from 'ember-intl/test-support';
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
    const invitation = store.createRecord('certification-center-invitation', {
      id: '1',
      email: 'camille.onette@example.net',
      updatedAt: new Date('2023-09-21T16:21:12Z'),
    });
    this.set('invitations', [invitation]);

    // when
    const screen = await renderScreen(
      hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
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
      id: '1',
      email: 'camille.onette@example.net',
      updatedAt: new Date('2023-09-21T16:21:12Z'),
    });

    const secondInvitation = store.createRecord('certification-center-invitation', {
      id: '2',
      email: 'lee.tige@example.net',
      updatedAt: new Date('2023-09-20T16:21:12Z'),
    });

    this.set('invitations', [invitation, secondInvitation]);

    //  when
    const screen = await renderScreen(
      hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
    );

    // then
    const table = screen.getByRole('table', { name: t('pages.team-invitations.table.caption') });
    assert.dom(within(table).getByRole('cell', { name: 'camille.onette@example.net' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'lee.tige@example.net' })).exists();

    const timeFormat = 'DD/MM/YYYY [-] HH:mm';
    const TimeOfFirstInvitation = dayjs(invitation.updatedAt).format(timeFormat);
    const TimeOfSecondInvitation = dayjs(secondInvitation.updatedAt).format(timeFormat);
    assert.dom(within(table).getByRole('cell', { name: TimeOfFirstInvitation })).exists();
    assert.dom(within(table).getByRole('cell', { name: TimeOfSecondInvitation })).exists();
  });

  module('when the user clicks on the cancel invitation button', function () {
    test('calls the cancel invitation action', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');

      this.set('invitations', [invitation]);

      await renderScreen(
        hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
      );

      // when
      await clickByName(t('pages.team-invitations.actions.cancel-invitation'));

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
        hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
      );

      // when
      await clickByName(t('pages.team-invitations.actions.resend-invitation'));

      // then
      assert.ok(resendInvitation.calledWith(invitation));
    });
  });

  module('when certification center invitation has already been resent', function () {
    test('disables the resend invitation button', async function (assert) {
      // given
      const invitation = store.createRecord('certification-center-invitation');

      invitation.isResendingInvitation = true;

      this.set('invitations', [invitation]);
      this.set('cancelInvitation', sinon.stub());
      this.set('resendInvitation', sinon.stub());

      // when
      const screen = await renderScreen(
        hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
      );

      // then
      assert.dom(screen.getByRole('button', { name: "Renvoyer l'invitation" })).isDisabled();
    });
  });

  module('when there is no invitation', function () {
    test('should display empty message', async function (assert) {
      // given
      this.set('invitations', []);

      // when
      const screen = await renderScreen(
        hbs`<Team::InvitationsList
  @invitations={{this.invitations}}
  @onCancelInvitationButtonClicked={{this.cancelInvitation}}
  @onResendInvitationButtonClicked={{this.resendInvitation}}
/>`,
      );

      // then
      assert.dom(screen.getByText(t('common.labels.table.empty-result'))).exists();
    });
  });
});
