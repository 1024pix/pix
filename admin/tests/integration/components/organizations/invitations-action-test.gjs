import { clickByText } from '@1024pix/ember-testing-library';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import InvitationsAction from 'pix-admin/components/organizations/invitations-action';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | organization-invitations-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it should create organization invitation with default language and default role value', async function (assert) {
    // given
    const createOrganizationInvitationStub = sinon.stub();
    const createOrganizationInvitation = createOrganizationInvitationStub;
    const noop = () => {};

    // when
    await render(
      <template>
        <InvitationsAction
          @createOrganizationInvitation={{createOrganizationInvitation}}
          @onChangeUserEmailToInvite={{noop}}
        />
      </template>,
    );
    await clickByText('Inviter');

    // then
    sinon.assert.calledWith(createOrganizationInvitationStub, 'fr-fr', null);
    assert.ok(true);
  });
});
