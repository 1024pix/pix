import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
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
    this.set('invitations', [
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
    ]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);

    // then
    assert.dom(`[aria-label="${t('pages.team-invitations.table.row.aria-label')}"]`).exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function (assert) {
    // given
    const dayjsService = this.owner.lookup('service:dayjs');
    const pendingInvitationDate = '2023-12-05T09:00:00Z';

    this.set('invitations', [{ email: 'gigi@example.net', isPending: true, updatedAt: pendingInvitationDate }]);

    // when
    const component = await render(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);

    // then
    const formattedPendingInvitationDate = dayjsService.self(pendingInvitationDate).format('DD/MM/YYYY [-] HH:mm');

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
    sinon.stub(notifications, 'success');

    this.set('invitations', [invitation]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);

    await clickByName(t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(notifications.success, t('pages.team-invitations.invitation-cancelled-succeed-message'));
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
    sinon.stub(notifications, 'error');

    this.set('invitations', [invitation]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{this.invitations}} />`);
    await clickByName(t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(notifications.error, t('api-error-messages.global'));
    assert.ok(true);
  });
});
