import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Integration | Component | organization-team-actions-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it should call addMembership method', async function (assert) {
    // given
    const addMembershipStub = sinon.stub();
    this.set('addMembership', addMembershipStub);
    this.set('noop', () => {});

    // when
    await render(hbs`<Organizations::TeamActionsSection
      @addMembership={{addMembership}}
      @createOrganizationInvitation={{noop}}
      @triggerFiltering={{noop}}/>`);

    await fillInByLabel('Ajouter un membre', 'user@example.net');
    await clickByLabel('Ajouter un membre');

    // then
    sinon.assert.called(addMembershipStub);
    assert.ok(true);
  });
});
