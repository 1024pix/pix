import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import sinon from 'sinon';
import { clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

class CurrentUserStub extends Service {
  organization = { id: 1 };
}

module('Integration | Component | Team::InvitationsListItem', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should show success notification when resending an invitation succeeds', async function (assert) {
    // given
    const notifications = this.owner.lookup('service:notifications');
    this.owner.register('service:current-user', CurrentUserStub);
    sinon.stub(notifications, 'success');

    const saveStub = sinon.stub();
    const cancelInvitationStub = sinon.stub();
    this.set('invitation', {
      id: 777,
      email: 'fifi@example.net',
      isPending: true,
      updatedAt: '2019-10-08T10:50:00Z',
      save: saveStub,
    });
    this.set('cancelInvitation', cancelInvitationStub);

    // when
    await render(
      hbs`<Team::InvitationsListItem @invitation={{this.invitation}} @cancelInvitation={{this.cancelInvitation}} />`
    );
    await clickByName(this.intl.t('pages.team-invitations.resend-invitation'));

    // then
    sinon.assert.calledWith(saveStub, {
      adapterOptions: {
        resendInvitation: true,
        email: 'fifi@example.net',
        organizationId: 1,
      },
    });
    sinon.assert.calledWith(
      notifications.success,
      this.intl.t('pages.team-new.success.invitation', { email: 'fifi@example.net' })
    );
    assert.ok(true);
  });
});
