import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Participant::LinkTo', function (hooks) {
  setupTest(hooks);

  module('organization is managing student', function () {
    test('should return route to sco participant details', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.organization = {
        isSco: true,
        isSup: false,
      };
      currentUser.isSCOManagingStudents = true;

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
      currentUser.isSUPManagingStudents = true;

      const component = await createGlimmerComponent('component:participant/link-to');

      // when
      const route = component.route;

      // then
      assert.strictEqual(route, 'authenticated.sup-organization-participants.sup-organization-participant');
    });
  });

  module('organization is not managing student', function () {
    test('should return route to participant details for sco', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.organization = {
        isSco: true,
        isSup: false,
      };
      currentUser.isSCOManagingStudents = false;

      const component = await createGlimmerComponent('component:participant/link-to');

      // when
      const route = component.route;

      // then
      assert.strictEqual(route, 'authenticated.organization-participants.organization-participant');
    });

    test('should return route to participant details for sup', async function (assert) {
      // given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.organization = {
        isSco: false,
        isSup: true,
      };
      currentUser.isSUPManagingStudents = false;

      const component = await createGlimmerComponent('component:participant/link-to');

      // when
      const route = component.route;

      // then
      assert.strictEqual(route, 'authenticated.organization-participants.organization-participant');
    });

    test('should return route to participant details for pro', async function (assert) {
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
});
