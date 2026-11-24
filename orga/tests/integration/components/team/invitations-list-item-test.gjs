import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import InvitationsListItem from 'pix-orga/components/team/invitations-list-item';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

class CurrentUserStub extends Service {
  organization = { id: '1' };
}

module('Integration | Component | Team::InvitationsListItem', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should show success notification when resending an invitation succeeds', async function (assert) {
    // given
    const notifications = this.owner.lookup('service:notifications');
    this.owner.register('service:current-user', CurrentUserStub);
    sinon.stub(notifications, 'sendSuccess');

    const saveStub = sinon.stub();
    const cancelInvitationStub = sinon.stub();
    const invitation = {
      id: 777,
      email: 'fifi@example.net',
      isPending: true,
      updatedAt: '2019-10-08T10:50:00Z',
      save: saveStub,
    };
    const cancelInvitation = cancelInvitationStub;

    // when
    await render(
      <template><InvitationsListItem @invitation={{invitation}} @cancelInvitation={{cancelInvitation}} /></template>,
    );
    await clickByName(t('pages.team-invitations.resend-invitation'));

    // then
    sinon.assert.calledWith(saveStub, {
      adapterOptions: {
        resendInvitation: true,
        email: 'fifi@example.net',
        organizationId: '1',
      },
    });
    sinon.assert.calledWith(
      notifications.sendSuccess,
      t('pages.team-new.success.invitation', { email: 'fifi@example.net' }),
    );
    assert.ok(true);
  });
});
