import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | organization-team-actions-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it should call addOrganizationMembership method', async function (assert) {
    // given
    const addOrganizationMembershipStub = sinon.stub();
    this.set('addOrganizationMembership', addOrganizationMembershipStub);
    this.set('noop', () => {});

    // when
    await render(hbs`<Organizations::TeamActionsSection
      @addOrganizationMembership={{addOrganizationMembership}}
      @createOrganizationInvitation={{noop}}
      @triggerFiltering={{noop}}
      @onChangeUserEmailToAdd={{noop}} />`);

    await fillByLabel('Ajouter un membre', 'user@example.net');
    await clickByName('Ajouter un membre');

    // then
    sinon.assert.called(addOrganizationMembershipStub);
    assert.ok(true);
  });
});
