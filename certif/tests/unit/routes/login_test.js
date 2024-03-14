import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | login', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:login');
    assert.ok(route);
  });

  module('#setupController', function () {
    test('it should set property "isInvitationCancelled" to true', function (assert) {
      // given
      const route = this.owner.lookup('route:login');
      const controller = { set: sinon.stub() };
      const model = {};
      const transition = { data: { isInvitationCancelled: true } };

      // when
      route.setupController(controller, model, transition);

      // then
      assert.ok(controller.set.calledWith('isInvitationCancelled', true));
    });

    test('it should set property "hasInvitationAlreadyBeenAccepted" to true', function (assert) {
      // given
      const route = this.owner.lookup('route:login');
      const controller = { set: sinon.stub() };
      const model = {};
      const transition = { data: { hasInvitationAlreadyBeenAccepted: true } };

      // when
      route.setupController(controller, model, transition);

      // then
      assert.ok(controller.set.calledWith('hasInvitationAlreadyBeenAccepted', true));
    });
  });
});
