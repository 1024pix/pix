import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | join', function (hooks) {
  setupTest(hooks);

  module('when invitation was cancelled', function () {
    test('should redirect to login route with isInvitationCancelled true', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');
      const store = this.owner.lookup('service:store');

      sinon.stub(route.router, 'replaceWith');
      sinon.stub(store, 'queryRecord');
      const forbiddenError = { status: '403' };
      store.queryRecord.rejects({ errors: [forbiddenError] });
      const transition = { data: { isInvitationCancelled: false } };
      route.router.replaceWith.returns(transition);

      const params = {
        invitationId: 2,
        code: 'ABCDEF',
      };

      // when
      await route.model(params);

      // then
      assert.ok(route.router.replaceWith.calledWith('login'));
      assert.true(transition.data['isInvitationCancelled']);
    });
  });
});
