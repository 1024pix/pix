import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { clickByText } from '@1024pix/ember-testing-library';

module('Integration | Component | organization-invitations-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it should create organization invitation with default language and default role value', async function (assert) {
    // given
    const createOrganizationInvitationStub = sinon.stub();
    this.set('createOrganizationInvitation', createOrganizationInvitationStub);
    this.set('noop', () => {});

    // when
    await render(
      hbs`<Organizations::InvitationsAction
  @createOrganizationInvitation={{this.createOrganizationInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`
    );
    await clickByText('Inviter');

    // then
    sinon.assert.calledWith(createOrganizationInvitationStub, 'fr-fr', null);
    assert.ok(true);
  });
});
