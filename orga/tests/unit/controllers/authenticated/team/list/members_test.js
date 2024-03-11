import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/team/list/members', function (hooks) {
  setupTest(hooks);
  const currentUser = { organization: { id: 1 } };
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/team/list/members');
    controller.send = sinon.stub();
    controller.currentUser = currentUser;
  });

  module('#removeMembership', () => {
    test('should set current organization to the membership ', async function (assert) {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };

      // when
      await controller.removeMembership(membership);

      // then
      assert.strictEqual(membership.organization, currentUser.organization);
    });

    test('should call disable membership endpoint', async function (assert) {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };
      const expectedAdapterOptions = { adapterOptions: { disable: true } };

      // when
      await controller.removeMembership(membership);

      // then
      sinon.assert.calledWith(saveStub, expectedAdapterOptions);
      assert.ok(true);
    });

    test("should call route's refreshModel action", async function (assert) {
      // given
      const saveStub = sinon.stub();
      const membership = {
        save: saveStub,
      };

      // when
      await controller.removeMembership(membership);

      // then
      sinon.assert.calledWith(controller.send, 'refreshModel');
      assert.ok(true);
    });
  });

  module('#leaveOrganization', function () {
    test('disables current user membership', async function (assert) {
      // given
      const adapter = { leaveOrganization: sinon.stub().resolves() };
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'adapterFor').returns(adapter);

      // when
      await controller.leaveOrganization();

      // then
      sinon.assert.calledWith(adapter.leaveOrganization, currentUser.organization.id);
      assert.ok(true);
    });
  });
});
