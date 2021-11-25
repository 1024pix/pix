import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { clickByLabel } from '../../../helpers/testing-library';
import sinon from 'sinon';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  organization = { id: 1 };
}

module('Integration | Component | Team::InvitationsList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should list the pending team invitations', async function (assert) {
    // given
    this.set('invitations', [
      { email: 'gigi@example.net', isPending: true, updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
      { email: 'gogo@example.net', isPending: true, updatedAt: moment('2019-10-08T10:50:00Z').utcOffset(2) },
    ]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);

    // then
    assert.dom(`[aria-label="${this.intl.t('pages.team-invitations.table.row.aria-label')}"]`).exists({ count: 2 });
  });

  test('it should display email and creation date of invitation', async function (assert) {
    // given
    const pendingInvitationDate = moment('2019-10-08T10:50:00Z').utcOffset(2);

    this.set('invitations', [{ email: 'gigi@example.net', isPending: true, updatedAt: pendingInvitationDate }]);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);

    // then
    assert.contains('gigi@example.net');
    assert.contains(
      `${this.intl.t('pages.team-invitations.table.row.message')} ${moment(pendingInvitationDate).format(
        'DD/MM/YYYY - HH:mm'
      )}`
    );
  });

  test('it should show success notification when cancelling an invitation succeeds', async function (assert) {
    // given
    const pendingInvitationDate = moment('2019-10-08T10:50:00Z').utcOffset(2);
    const invitation = {
      id: 777,
      email: 'gigi@example.net',
      isPending: true,
      updatedAt: pendingInvitationDate,
    };

    const notifications = this.owner.lookup('service:notifications');
    const store = this.owner.lookup('service:store');
    this.owner.register('service:current-user', CurrentUserStub);
    const queryRecordStub = sinon.stub();
    store.queryRecord = queryRecordStub.resolves();
    sinon.stub(notifications, 'success');

    this.set('invitations', [invitation]);
    this.set('store', store);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);
    await clickByLabel(this.intl.t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(
      notifications.success,
      this.intl.t('pages.team-invitations.invitation-cancelled-succeed-message')
    );
    assert.ok(true);
  });

  test('it should show error notification when cancelling an invitation fails', async function (assert) {
    // given
    const pendingInvitationDate = moment('2019-10-08T10:50:00Z').utcOffset(2);
    const invitation = {
      id: 777,
      email: 'gigi@example.net',
      updatedAt: pendingInvitationDate,
      isPending: true,
    };

    const notifications = this.owner.lookup('service:notifications');
    const store = this.owner.lookup('service:store');
    this.owner.register('service:current-user', CurrentUserStub);
    const queryRecordStub = sinon.stub();
    store.queryRecord = queryRecordStub.rejects();
    sinon.stub(notifications, 'error');

    this.set('invitations', [invitation]);
    this.set('store', store);

    // when
    await render(hbs`<Team::InvitationsList @invitations={{invitations}}/>`);
    await clickByLabel(this.intl.t('pages.team-invitations.cancel-invitation'));

    // then
    sinon.assert.calledWith(notifications.error, this.intl.t('api-errors-messages.global'));
    assert.ok(true);
  });
});
