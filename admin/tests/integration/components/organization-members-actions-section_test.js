import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Integration | Component | organization-members-actions-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it should call addMembership method', async function (assert) {
    // given
    const addMembershipStub = sinon.stub();
    this.set('addMembership', addMembershipStub);
    this.set('noop', () => {});

    // when
    await render(hbs`<OrganizationMembersActionsSection
      @addMembership={{addMembership}}
      @createOrganizationInvitation={{noop}}
      @triggerFiltering={{noop}}/>`);

    await fillInByLabel('Ajouter un membre', 'user@example.net');
    await clickByLabel('Valider');

    // then
    sinon.assert.called(addMembershipStub);
    assert.ok(true);
  });

  test('it should create organization invitation with choosen language', async function (assert) {
    // given
    const createOrganizationInvitationStub = sinon.stub();
    this.set('createOrganizationInvitation', createOrganizationInvitationStub);
    this.set('memberships', []);
    this.set('noop', () => {});

    // when
    await render(hbs`<OrganizationMembersActionsSection
      @memberships={{memberships}}
      @addMembership={{noop}}
      @createOrganizationInvitation={{createOrganizationInvitation}}
      @triggerFiltering={{noop}}
      @selectRoleForSearch={{noop}}/>`);
    await clickByLabel('Inviter');

    // then
    sinon.assert.neverCalledWith(createOrganizationInvitationStub, 'fr');
    assert.ok(true);
  });
});
