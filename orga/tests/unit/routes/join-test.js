import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | join', function (hooks) {
  setupTest(hooks);

  module('when invitation was cancelled', function () {
    test('should redirect to login route with isInvitationCancelled true', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');

      sinon.stub(route.router, 'replaceWith');
      const transition = { data: {} };
      route.router.replaceWith.returns(transition);

      route.isInvitationCancelled = true;
      // when
      await route.redirect(null);

      // then
      assert.ok(route.router.replaceWith.calledWith('login'));
      assert.true(transition.data.isInvitationCancelled);
      assert.false(transition.data.hasInvitationAlreadyBeenAccepted);
    });

    test('should redirect to login route with hasInvitationAlreadyBeenAccepted true', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');

      sinon.stub(route.router, 'replaceWith');
      const transition = { data: {} };
      route.router.replaceWith.returns(transition);

      route.hasInvitationAlreadyBeenAccepted = true;

      // when
      await route.redirect(null);

      // then
      assert.ok(route.router.replaceWith.calledWith('login'));
      assert.false(transition.data.isInvitationCancelled);
      assert.true(transition.data.hasInvitationAlreadyBeenAccepted);
    });
  });
});
