import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import TeamInvitationsList from 'pix-orga/components/team/invitations-list';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

class CurrentUserStub extends Service {
  organization = { id: '1' };
}

module('Integration | Component | Team::InvitationsList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should list the pending team invitations', async function (assert) {
    // given
    const invitations = [
      {
        email: 'gigi@example.net',
        isPending: true,
        updatedAt: '2019-10-08T10:50:00Z',
      },
      {
        email: 'gogo@example.net',
        isPending: true,
        updatedAt: '2019-10-08T10:50:00Z',
      },
    ];

    // when
    const screen = await render(<template><TeamInvitationsList @invitations={{invitations}} /></template>);

    // then
    assert.strictEqual(screen.getAllByRole('row').length, 3);
  });

  test('it should display email and creation date of invitation', async function (assert) {
    // given
    const intl = this.owner.lookup('service:intl');
    const pendingInvitationDate = '2023-12-05T09:00:00Z';

    const invitations = [{ email: 'gigi@example.net', isPending: true, updatedAt: pendingInvitationDate }];

    // when
    const component = await render(<template><TeamInvitationsList @invitations={{invitations}} /></template>);

    // then
    const formattedPendingInvitationDate = intl.formatDate(pendingInvitationDate, { format: 'medium' });

    assert.dom(component.getByRole('cell', { name: 'gigi@example.net' })).exists();
    assert.dom(component.getByRole('cell', { name: formattedPendingInvitationDate })).exists();
  });

  test('it should show success notification when cancelling an invitation succeeds', async function (assert) {
    // given
    const pendingInvitationDate = '2019-10-08T10:50:00Z';
    const invitation = {
      id: '777',
      email: 'gigi@example.net',
      isPending: true,
      updatedAt: pendingInvitationDate,
      deleteRecord: sinon.stub(),
      save: sinon.stub(),
    };

    const notifications = this.owner.lookup('service:notifications');
    this.owner.register('service:current-user', CurrentUserStub);
    sinon.stub(notifications, 'sendSuccess');

    const invitations = [invitation];

    // when
    await render(<template><TeamInvitationsList @invitations={{invitations}} /></template>);

    await clickByName(t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(
      notifications.sendSuccess,
      t('pages.team-invitations.invitation-cancelled-succeed-message'),
    );
    assert.ok(true);
  });

  test('it should show error notification when cancelling an invitation fails', async function (assert) {
    // given
    const pendingInvitationDate = '2019-10-08T10:50:00Z';
    const invitation = {
      id: '777',
      email: 'gigi@example.net',
      updatedAt: pendingInvitationDate,
      isPending: true,
      deleteRecord: sinon.stub(),
      save: sinon.stub(),
    };

    const notifications = this.owner.lookup('service:notifications');
    this.owner.register('service:current-user', CurrentUserStub);
    invitation.save.rejects();
    sinon.stub(notifications, 'sendError');

    const invitations = [invitation];

    // when
    await render(<template><TeamInvitationsList @invitations={{invitations}} /></template>);
    await clickByName(t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(notifications.sendError, t('api-error-messages.global'));
    assert.ok(true);
  });
});
