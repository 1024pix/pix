import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | organization-members-section', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of members', async function(assert) {
    // given
    this.set('noop', () => {});
    const user1 = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    const user2 = EmberObject.create({ firstName: 'Froufrou', lastName: 'Le froussard', email: 'froufrou@lefroussard.fr' });
    const membership1 = EmberObject.create({ id: 1, user: user1, displayedOrganizationRole: 'Administrateur', save: () => {} });
    const membership2 = EmberObject.create({ id: 1, user: user2, displayedOrganizationRole: 'Membre', save: () => {} });
    const memberships = [membership1, membership2];
    this.set('memberships', memberships);
    memberships.meta = { rowCount: 2 };

    // when
    await render(hbs`<OrganizationMembersSection
      @memberships={{memberships}}
      @addMembership={{noop}}
      @createOrganizationInvitation={{noop}}
      @triggerFiltering={{noop}}
      @selectRoleForSearch={{noop}}/>`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });
  });

  test('it should create organization invitation with choosen language', async function(assert) {
    // given
    const createOrganizationInvitationStub = sinon.stub();
    this.set('createOrganizationInvitation', createOrganizationInvitationStub);
    this.set('memberships', []);
    this.set('noop', () => {});

    // when
    await render(hbs`<OrganizationMembersSection
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
