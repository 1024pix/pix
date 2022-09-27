import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | organization-team-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of members', async function (assert) {
    // given
    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
    this.set('noop', () => {});
    const user1 = EmberObject.create({ firstName: 'Jojo', lastName: 'La Gringue', email: 'jojo@lagringue.fr' });
    const user2 = EmberObject.create({
      firstName: 'Froufrou',
      lastName: 'Le froussard',
      email: 'froufrou@lefroussard.fr',
    });
    const membership1 = EmberObject.create({
      id: 1,
      user: user1,
      displayedOrganizationRole: 'Administrateur',
      save: () => {},
    });
    const membership2 = EmberObject.create({ id: 1, user: user2, displayedOrganizationRole: 'Membre', save: () => {} });
    const organizationMemberships = [membership1, membership2];
    this.set('organizationMemberships', organizationMemberships);
    organizationMemberships.meta = { rowCount: 2 };

    // when
    const screen = await render(hbs`<Organizations::TeamSection
      @organizationMemberships={{organizationMemberships}}
      @addOrganizationMembership={{noop}}
      @createOrganizationInvitation={{noop}}
      @triggerFiltering={{noop}}
      @selectRoleForSearch={{noop}}/>`);

    // then
    assert.strictEqual(screen.getAllByLabelText('Membre').length, 2);
  });
});
