import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Participant::LinkTo', function (hooks) {
  setupTest(hooks);

  test('should return route to sco participant details', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {
      isSco: true,
      isSup: false,
    };
    const component = await createGlimmerComponent('component:participant/link-to');

    // when
    const route = component.route;

    // then
    assert.strictEqual(route, 'authenticated.sco-organization-participants.sco-organization-participant');
  });

  test('should return route to sup participant details', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {
      isSco: false,
      isSup: true,
    };
    const component = await createGlimmerComponent('component:participant/link-to');

    // when
    const route = component.route;

    // then
    assert.strictEqual(route, 'authenticated.sup-organization-participants.sup-organization-participant');
  });

  test('should return route to participant details', async function (assert) {
    // given
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {
      isSco: false,
      isSup: false,
    };
    const component = await createGlimmerComponent('component:participant/link-to');

    // when
    const route = component.route;

    // then
    assert.strictEqual(route, 'authenticated.organization-participants.organization-participant');
  });
});
