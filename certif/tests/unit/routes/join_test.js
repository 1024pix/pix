import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | join', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return certification center name', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');
      const store = this.owner.lookup('service:store');

      const jirayaInvitation = store.createRecord('certification-center-invitation', {
        certificationCenterName: 'Ninja School',
      });
      sinon.stub(store, 'queryRecord');
      store.queryRecord
        .withArgs('certification-center-invitation', {
          invitationId: 12345,
          code: 'JIJI987',
        })
        .resolves(jirayaInvitation);

      // when
      const params = {
        invitationId: 12345,
        code: 'JIJI987',
      };
      const { certificationCenterName } = await route.model(params);

      // then
      assert.strictEqual(certificationCenterName, 'Ninja School');
    });

    module('when invitation was cancelled', function () {
      test('it should redirect to login route with isInvitationCancelled set to true', async function (assert) {
        // given
        const route = this.owner.lookup('route:join');
        const store = this.owner.lookup('service:store');

        sinon.stub(route.router, 'replaceWith');
        sinon.stub(store, 'queryRecord');
        const forbiddenError = { status: '403' };
        store.queryRecord.rejects({ errors: [forbiddenError] });
        const transition = { data: { isInvitationCancelled: false } };
        route.router.replaceWith.returns(transition);
        const oldTransition = { abort: sinon.stub() };

        const params = {
          invitationId: 2,
          code: 'ABCDEF',
        };

        // when
        await route.model(params, oldTransition);

        // then
        assert.ok(route.router.replaceWith.calledWith('login'));
        assert.true(transition.data['isInvitationCancelled']);
        assert.true(oldTransition.abort.called);
      });
    });

    module('when invitation was accepted', function () {
      test('should redirect to login route with hasInvitationAlreadyBeenAccepted set to true', async function (assert) {
        // given
        const route = this.owner.lookup('route:join');
        const store = this.owner.lookup('service:store');

        sinon.stub(route.router, 'replaceWith');
        sinon.stub(store, 'queryRecord');
        const preconditionFailedError = { status: '412' };
        store.queryRecord.rejects({ errors: [preconditionFailedError] });
        const transition = { data: { hasInvitationAlreadyBeenAccepted: false } };
        route.router.replaceWith.returns(transition);
        const oldTransition = { abort: sinon.stub() };

        const params = {
          invitationId: 2,
          code: 'ABCDEF',
        };

        // when
        await route.model(params, oldTransition);

        // then
        assert.ok(route.router.replaceWith.calledWith('login'));
        assert.true(transition.data['hasInvitationAlreadyBeenAccepted']);
        assert.true(oldTransition.abort.called);
      });
    });
  });
});
